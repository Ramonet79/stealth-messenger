import { useState, useEffect } from 'react';
import { Message } from '@/components/Messenger/types';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { messageService } from '@/services/messageService';
import { useToast } from '@/hooks/use-toast';

export const useMessages = (updateContactMessage: (contactId: string, message: string, timestamp: string, unread?: boolean) => void) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    
    console.log("Configurando suscripción a mensajes entrantes para usuario:", user.id);
    
    const { unsubscribe } = messageService.subscribeToNewMessages(user.id, (newMessage) => {
      console.log("Mensaje nuevo recibido:", newMessage);
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      const now = new Date();
      const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const messagePreview = newMessage.type === 'text' 
        ? newMessage.text 
        : newMessage.type === 'image' 
          ? '📷 Imagen' 
          : newMessage.type === 'video' 
            ? '🎥 Video' 
            : '🎤 Audio';
      
      updateContactMessage(newMessage.contactId, messagePreview, timestamp, true);
    });
    
    return () => {
      unsubscribe();
    };
  }, [user, updateContactMessage]);

  const loadMessages = async (userId: string | undefined, contactId: string) => {
    if (!userId || !contactId) return;
    
    try {
      const { data, error } = await messageService.getMessages(userId, contactId);
      
      if (error) {
        console.error("Error al cargar mensajes:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los mensajes",
        });
        return;
      }
      
      if (data) {
        console.log(`Cargados ${data.length} mensajes para la conversación`);
        setMessages(data);
        
        data.forEach(msg => {
          if (!msg.sent && msg.status !== 'read') {
            messageService.updateMessageStatus(msg.id, 'read');
          }
        });
      }
    } catch (error) {
      console.error("Error inesperado al cargar mensajes:", error);
    }
  };

  const handleSendMessage = async (userId: string | undefined, contactId: string, text: string, type: 'text' | 'image' | 'audio' | 'video' = 'text', mediaUrl?: string) => {
    if (!contactId || !userId) return;
    
    try {
      const { data, error } = await messageService.sendMessage(
        userId,
        contactId,
        text,
        type,
        mediaUrl
      );
      
      if (error) {
        console.error("Error al enviar mensaje:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo enviar el mensaje",
        });
        return;
      }
      
      if (data) {
        console.log("Mensaje enviado correctamente:", data);
        setMessages(prevMessages => [...prevMessages, data]);
        
        const now = new Date();
        const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const messagePreview = type === 'text' 
          ? text 
          : type === 'image' 
            ? '📷 Imagen' 
            : type === 'video' 
              ? '🎥 Video' 
              : '🎤 Audio';
        
        updateContactMessage(contactId, messagePreview, timestamp, false);
      }
    } catch (error) {
      console.error("Error inesperado al enviar mensaje:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje",
      });
    }
  };

  return {
    messages,
    setMessages,
    loadMessages,
    handleSendMessage
  };
};
