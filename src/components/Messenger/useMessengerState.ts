
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Contact, Message, Request, AppView } from './types';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { patternService } from '@/services/patternService';
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
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      contactId: '1',
      text: 'Hola, ¿cómo estás?',
      sent: false,
      timestamp: '10:45',
      status: 'read'
    },
    {
      id: '2',
      contactId: '1',
      text: 'Muy bien, ¿y tú?',
      sent: true,
      timestamp: '10:46',
      status: 'read'
    },
    {
      id: '3',
      contactId: '1',
      text: 'Todo perfecto, gracias. ¿Tienes un momento para hablar?',
      sent: false,
      timestamp: '10:47',
      status: 'read'
    },
    {
      id: '4',
      contactId: '2',
      text: '¿Te llegaron los archivos que envié?',
      sent: false,
      timestamp: 'Ayer',
      status: 'delivered'
    },
    {
      id: '5',
      contactId: '3',
      text: 'Ok, nos vemos mañana entonces.',
      sent: false,
      timestamp: 'Lun',
      status: 'delivered'
    },
  ]);
  
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
  const [username] = useState<string>('dscrt_user123');
  const [showPatternLock, setShowPatternLock] = useState<boolean>(false);
  const [contactsWithActiveLock, setContactsWithActiveLock] = useState<string[]>([]);
  
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  // Check contacts with active pattern locks
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
  
  // Handle unread messages notification
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
      
      setMessages(messages.map(message =>
        message.contactId === contactId && !message.sent 
          ? { ...message, status: 'read' } 
          : message
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
        
        setMessages(messages.map(message =>
          message.contactId === selectedContactId && !message.sent 
            ? { ...message, status: 'read' } 
            : message
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

  const handleSendMessage = (text: string, type: 'text' | 'image' | 'audio' = 'text', mediaUrl?: string) => {
    if (!selectedContactId) return;
    
    const now = new Date();
    const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newMessage: Message = {
      id: uuidv4(),
      contactId: selectedContactId,
      text,
      sent: true,
      timestamp,
      status: 'sent',
      type,
      mediaUrl
    };
    
    setMessages([...messages, newMessage]);
    
    setContacts(contacts.map(contact => 
      contact.id === selectedContactId ? 
        { 
          ...contact, 
          lastMessage: type === 'text' ? text : type === 'image' ? '📷 Imagen' : '🎤 Audio',
          timestamp 
        } : contact
    ));
  };

  const handleCreateChat = (phone: string, name: string) => {
    const now = new Date();
    const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newContact: Contact = {
      id: uuidv4(),
      name,
      phone,
      lastMessage: 'Nuevo contacto',
      timestamp,
      unread: false
    };
    
    setContacts([newContact, ...contacts]);
    setSelectedContactId(newContact.id);
    setView('conversation');
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
