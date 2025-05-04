
import { useState, useEffect } from 'react';
import { AppView, Contact } from '@/components/Messenger/types';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useContacts } from './useContacts';
import { useMessages } from './useMessages';
import { useRequests } from './useRequests';
import { usePatternLock } from './usePatternLock';
import { useUsername } from './useUsername';
import { v4 as uuidv4 } from 'uuid';

export const useMessengerState = (onUnreadMessagesChange?: (hasUnread: boolean) => void) => {
  const [view, setView] = useState<AppView>('list');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  
  const { user } = useSupabaseAuth();
  const { username } = useUsername();
  
  const {
    contacts,
    contactsWithActiveLock,
    handleCreateChat,
    handleEditContact,
    handleDeleteContact,
    updateContactMessage,
    markContactAsRead
  } = useContacts();
  
  const {
    messages,
    setMessages,
    loadMessages,
    handleSendMessage
  } = useMessages(updateContactMessage);
  
  const {
    pendingRequests,
    handleAcceptRequest,
    handleRejectRequest,
    handleBlockRequest
  } = useRequests();
  
  const {
    showPatternLock,
    setShowPatternLock,
    handlePatternComplete,
    handleSaveContactPattern
  } = usePatternLock();

  console.log("useMessengerState - Contactos actuales:", contacts);
  
  // Effect to check for unread messages and notify
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
  
  // Effect to load messages when a conversation is selected
  useEffect(() => {
    if (!user || !selectedContactId || view !== 'conversation') return;
    
    loadMessages(user.id, selectedContactId);
    
  }, [user, selectedContactId, view, loadMessages]);

  const handleSelectContact = async (contactId: string) => {
    if (user && contactsWithActiveLock.includes(contactId)) {
      setSelectedContactId(contactId);
      setShowPatternLock(true);
    } else {
      setSelectedContactId(contactId);
      setView('conversation');
      
      markContactAsRead(contactId);
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
    handlePatternComplete: (pattern: number[]) => 
      selectedContactId ? handlePatternComplete(selectedContactId, pattern) : Promise.resolve(false),
    handleSendMessage: (text: string, type: 'text' | 'image' | 'audio' | 'video' = 'text', mediaUrl?: string) =>
      handleSendMessage(user?.id, selectedContactId!, text, type, mediaUrl),
    handleCreateChat,
    handleAcceptRequest: (requestId: string) => {
      const request = handleAcceptRequest(requestId);
      
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
        
        handleCreateChat(request.username, request.username);
        setView('list');
      }
    },
    handleRejectRequest,
    handleBlockRequest,
    handleEditContact,
    handleDeleteContact: (contactId: string) => {
      handleDeleteContact(contactId);
      setMessages(messages.filter(message => message.contactId !== contactId));
    },
    handleSaveContactPattern,
  };
};
