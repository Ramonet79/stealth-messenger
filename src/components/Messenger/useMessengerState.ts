import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Contact, Message, Request, AppView } from './types';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { patternService } from '@/services/patternService';
import { messageService } from '@/services/messageService';
import { useToast } from '@/hooks/use-toast';

export const useMessengerState = (onUnreadMessagesChange?: (hasUnread: boolean) => void) => {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'John Doe',
      phone: '+1234567890',
      lastMessage: 'Hola, ¿cómo estás?',
      timestamp: '10:45',
      unread: true
    },
    {
      id: '2',
      name: 'María García',
      phone: '+34612345678',
      lastMessage: '¿Te llegaron los archivos que envié?',
      timestamp: 'Ayer',
      unread: false
    },
    {
      id: '3',
      name: 'Alex Smith',
      phone: '+44712345678',
      lastMessage: 'Ok, nos vemos mañana entonces.',
      timestamp: 'Lun',
      unread: false
    }
  ]);
  
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [pendingRequests, setPendingRequests] = useState<Request[]>([
    {
      id: '1',
      username: 'carlos92',
      timestamp: 'Hace 2h',
      status: 'pending'
    },
    {
      id: '2',
      username: 'laura.martinez',
      timestamp: 'Hace 1d',
      status: 'pending'
    }
  ]);
  
  const [view, setView] = useState<AppView>('list');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [showPatternLock, setShowPatternLock] = useState<boolean>(false);
  const [contactsWithActiveLock, setContactsWithActiveLock] = useState<string[]>([]);
  
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && user.email) {
      const extractedUsername = user.user_metadata?.username || 
                               user.email.split('@')[0] || 
                               `usuario_${user.id.substring(0, 8)}`;
      setUsername(extractedUsername);
      console.log('Username actualizado:', extractedUsername);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    console.log("Configurando suscripción a mensajes entrantes para usuario:", user.id);
    
    const { unsubscribe } = messageService.subscribeToNewMessages(user.id, (newMessage) => {
      console.log("Mensaje nuevo recibido:", newMessage);
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.id === newMessage.contactId ? 
          {
            ...contact,
            lastMessage: newMessage.type === 'text' ? newMessage.text : newMessage.type === 'image' ? '📷 Imagen' : newMessage.type === 'video' ? '🎥 Video' : '🎤 Audio',
            timestamp: newMessage.timestamp,
            unread: true
          } : contact
        )
      );
      
      if (selectedContactId === newMessage.contactId && view === 'conversation') {
        messageService.updateMessageStatus(newMessage.id, 'read');
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [user, selectedContactId, view]);

  useEffect(() => {
    const checkContactsWithLock = async () => {
      if (!user) return;
      
      const activeLocksIds: string[] = [];
      
      for (const contact of contacts) {
        try {
          const hasLock = await patternService.contactHasActivePattern(user.id, contact.id);
          if (hasLock) {
            activeLocksIds.push(contact.id);
          }
        } catch (error) {
          console.error("Error checking contact lock status:", error);
        }
      }
      
      setContactsWithActiveLock(activeLocksIds);
      
      setContacts(contacts.map(contact => ({
        ...contact,
        hasCustomLock: activeLocksIds.includes(contact.id)
      })));
    };
    
    checkContactsWithLock();
  }, [user]);
  
  useEffect(() => {
    const loadMessages = async () => {
      if (!user || !selectedContactId || view !== 'conversation') return;
      
      try {
        const { data, error } = await messageService.getMessages(user.id, selectedContactId);
        
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
    
    loadMessages();
  }, [user, selectedContactId, view]);
  
  useEffect(() => {
    const hasUnread = contacts.some(contact => contact.unread);
    
    if (onUnreadMessagesChange) {
      onUnreadMessagesChange(hasUnread);
    }
    
    const event = new CustomEvent('unreadMessagesUpdate', {
      detail: { hasUnreadMessages: hasUnread }
    });
    window.dispatchEvent(event);
  }, [contacts, onUnreadMessagesChange]);

  const handleSelectContact = async (contactId: string) => {
    if (user && contactsWithActiveLock.includes(contactId)) {
      setSelectedContactId(contactId);
      setShowPatternLock(true);
    } else {
      setSelectedContactId(contactId);
      setView('conversation');
      
      setContacts(contacts.map(contact => 
        contact.id === contactId ? { ...contact, unread: false } : contact
      ));
    }
  };

  const handlePatternComplete = async (pattern: number[]): Promise<boolean> => {
    if (!user || !selectedContactId) return false;
    
    try {
      const isValid = await patternService.verifyContactPattern(user.id, selectedContactId, pattern);
      
      if (isValid) {
        setShowPatternLock(false);
        setView('conversation');
        
        setContacts(contacts.map(contact => 
          contact.id === selectedContactId ? { ...contact, unread: false } : contact
        ));
        
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Patrón incorrecto",
          description: "El patrón introducido no es válido",
        });
        return false;
      }
    } catch (error) {
      console.error("Error verifying pattern:", error);
      return false;
    }
  };

  const handleSendMessage = async (text: string, type: 'text' | 'image' | 'audio' | 'video' = 'text', mediaUrl?: string) => {
    if (!selectedContactId || !user) return;
    
    try {
      const { data, error } = await messageService.sendMessage(
        user.id,
        selectedContactId,
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
        
        setContacts(contacts.map(contact => 
          contact.id === selectedContactId ? 
            { 
              ...contact, 
              lastMessage: type === 'text' ? text : type === 'image' ? '📷 Imagen' : type === 'video' ? '🎥 Video' : '🎤 Audio',
              timestamp 
            } : contact
        ));
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

  const handleCreateChat = async (contactUsername: string, contactAlias: string) => {
    if (!user) return;
    
    try {
      const { data: contactProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', contactUsername)
        .single();
      
      if (profileError || !contactProfile) {
        console.error("Error al buscar el perfil del contacto:", profileError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo encontrar el contacto especificado",
        });
        return;
      }
      
      const { data: newContactData, error: contactError } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          contact_id: contactProfile.id,
          name: contactAlias,
          full_name: contactUsername
        })
        .select()
        .single();
      
      if (contactError || !newContactData) {
        console.error("Error al crear contacto:", contactError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo crear el contacto",
        });
        return;
      }
      
      const now = new Date();
      const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const newContact: Contact = {
        id: newContactData.id,
        name: contactAlias,
        phone: '',
        lastMessage: 'Nuevo contacto',
        timestamp,
        unread: false,
        fullName: contactUsername
      };
      
      setContacts([newContact, ...contacts]);
      setSelectedContactId(newContact.id);
      setView('conversation');
      
      toast({
        title: "Contacto creado",
        description: `Has añadido a ${contactAlias} como contacto`,
      });
      
    } catch (error) {
      console.error("Error inesperado al crear contacto:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el contacto",
      });
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    const request = pendingRequests.find(req => req.id === requestId);
    
    if (request) {
      const now = new Date();
      const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const newContact: Contact = {
        id: uuidv4(),
        name: request.username,
        phone: '',
        lastMessage: 'Contacto añadido',
        timestamp,
        unread: false
      };
      
      setContacts([newContact, ...contacts]);
      
      setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
      
      toast({
        title: "Solicitud aceptada",
        description: `Has aceptado la solicitud de ${request.username}`,
      });
      
      setView('list');
    }
  };

  const handleRejectRequest = (requestId: string) => {
    setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
    
    toast({
      title: "Solicitud rechazada",
      description: "La solicitud ha sido rechazada",
    });
  };

  const handleBlockRequest = (requestId: string) => {
    setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
    
    toast({
      variant: "destructive",
      title: "Usuario bloqueado",
      description: "El usuario ha sido bloqueado y no podrá enviarte más solicitudes",
    });
  };

  const handleEditContact = (contactId: string, data: Partial<Contact>) => {
    setContacts(contacts.map(contact =>
      contact.id === contactId ? { ...contact, ...data } : contact
    ));
    
    toast({
      title: "Contacto actualizado",
      description: "La información del contacto ha sido actualizada",
    });
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts(contacts.filter(contact => contact.id !== contactId));
    
    setMessages(messages.filter(message => message.contactId !== contactId));
    
    toast({
      title: "Contacto eliminado",
      description: "El contacto ha sido eliminado de tu agenda",
    });
  };

  const handleSaveContactPattern = async (contactId: string, pattern: number[], enabled: boolean): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await patternService.saveContactPattern(user.id, contactId, pattern, enabled);
      
      if (error) {
        console.error("Error saving contact pattern:", error);
        return false;
      }
      
      if (enabled && !contactsWithActiveLock.includes(contactId)) {
        setContactsWithActiveLock([...contactsWithActiveLock, contactId]);
      } else if (!enabled && contactsWithActiveLock.includes(contactId)) {
        setContactsWithActiveLock(contactsWithActiveLock.filter(id => id !== contactId));
      }
      
      setContacts(contacts.map(contact =>
        contact.id === contactId ? { ...contact, hasCustomLock: enabled } : contact
      ));
      
      return true;
    } catch (error) {
      console.error("Error saving contact pattern:", error);
      return false;
    }
  };
  
  return {
    contacts,
    messages,
    pendingRequests,
    view,
    setView,
    selectedContactId,
    setSelectedContactId,
    username,
    showPatternLock,
    handleSelectContact,
    handlePatternComplete,
    handleSendMessage,
    handleCreateChat,
    handleAcceptRequest,
    handleRejectRequest,
    handleBlockRequest,
    handleEditContact,
    handleDeleteContact,
    handleSaveContactPattern,
  };
};
