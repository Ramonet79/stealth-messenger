
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/components/Messenger/types';
import { v4 as uuidv4 } from 'uuid';

export const messageService = {
  // Enviar un nuevo mensaje
  sendMessage: async (senderId: string, receiverId: string, text: string, type: 'text' | 'image' | 'audio' | 'video' = 'text', mediaUrl?: string): Promise<{ data: Message | null, error: any }> => {
    console.log(`📨 Enviando mensaje de ${senderId} a ${receiverId}: ${text} (tipo: ${type})`);
    
    const timestamp = new Date().toISOString();
    const messageId = uuidv4();
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            id: messageId,
            sender_id: senderId,
            receiver_id: receiverId,
            text,
            type,
            media_url: mediaUrl,
            created_at: timestamp,
            status: 'sent'
          }
        ]);
      
      if (error) {
        console.error("Error al enviar mensaje:", error);
        return { data: null, error };
      }
      
      const newMessage: Message = {
        id: messageId,
        contactId: receiverId,
        text,
        sent: true,
        timestamp: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
        type,
        mediaUrl
      };
      
      console.log(`📨 Mensaje enviado correctamente: ${messageId} (tipo: ${type})`);
      return { data: newMessage, error: null };
    } catch (error) {
      console.error("Error inesperado al enviar mensaje:", error);
      return { data: null, error };
    }
  },
  
  // Obtener mensajes para una conversación
  getMessages: async (userId: string, contactId: string): Promise<{ data: Message[] | null, error: any }> => {
    console.log(`📬 Obteniendo mensajes entre ${userId} y ${contactId}`);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .or(`sender_id.eq.${contactId},receiver_id.eq.${contactId}`)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error("Error al obtener mensajes:", error);
        return { data: null, error };
      }
      
      if (!data || data.length === 0) {
        console.log(`📭 No se encontraron mensajes entre ${userId} y ${contactId}`);
        return { data: [], error: null };
      }
      
      // Filtrar mensajes que corresponden a la conversación entre estos dos usuarios
      const filteredMessages = data.filter(msg => 
        (msg.sender_id === userId && msg.receiver_id === contactId) || 
        (msg.sender_id === contactId && msg.receiver_id === userId)
      );
      
      // Convertir a formato de mensaje de la aplicación
      const formattedMessages: Message[] = filteredMessages.map(msg => ({
        id: msg.id,
        contactId: msg.sender_id === userId ? msg.receiver_id : msg.sender_id,
        text: msg.text || '',
        sent: msg.sender_id === userId,
        timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: msg.status as 'sent' | 'delivered' | 'read',
        type: msg.type as 'text' | 'image' | 'audio' | 'video',
        mediaUrl: msg.media_url
      }));
      
      console.log(`📬 Recuperados ${formattedMessages.length} mensajes para la conversación`);
      return { data: formattedMessages, error: null };
    } catch (error) {
      console.error("Error inesperado al obtener mensajes:", error);
      return { data: null, error };
    }
  },
  
  // Actualizar el estado de un mensaje
  updateMessageStatus: async (messageId: string, status: 'sent' | 'delivered' | 'read'): Promise<{ data: any, error: any }> => {
    console.log(`🔄 Actualizando estado del mensaje ${messageId} a ${status}`);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ status })
        .eq('id', messageId);
      
      if (error) {
        console.error("Error al actualizar estado del mensaje:", error);
      } else {
        console.log(`🔄 Estado del mensaje actualizado correctamente: ${messageId} -> ${status}`);
      }
      
      return { data, error };
    } catch (error) {
      console.error("Error inesperado al actualizar estado del mensaje:", error);
      return { data: null, error };
    }
  },
  
  // Suscribirse a nuevos mensajes
  subscribeToNewMessages: (userId: string, onNewMessage: (message: Message) => void): { unsubscribe: () => void } => {
    console.log(`🔔 Suscribiéndose a nuevos mensajes para ${userId}`);
    
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        }, 
        (payload) => {
          console.log('🔔 Nuevo mensaje recibido:', payload);
          const msg = payload.new;
          
          // Convertir a formato de mensaje de la aplicación
          const newMessage: Message = {
            id: msg.id,
            contactId: msg.sender_id,
            text: msg.text || '',
            sent: false,
            timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: msg.status as 'sent' | 'delivered' | 'read',
            type: msg.type as 'text' | 'image' | 'audio' | 'video',
            mediaUrl: msg.media_url
          };
          
          onNewMessage(newMessage);
          
          // Actualizar estado a "delivered"
          messageService.updateMessageStatus(msg.id, 'delivered');
        }
      )
      .subscribe();
    
    return {
      unsubscribe: () => {
        console.log(`🔕 Cancelando suscripción a mensajes para ${userId}`);
        supabase.removeChannel(channel);
      }
    };
  }
};
