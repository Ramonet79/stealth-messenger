
import React, { useState } from 'react';
import ChatList from './ChatList';
import ChatConversation from './ChatConversation';
import NewChat from './NewChat';
import { v4 as uuidv4 } from 'uuid';

interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

interface Message {
  id: string;
  contactId: string;
  text: string;
  sent: boolean;
  timestamp: string;
}

interface MessengerAppProps {
  onLogout: () => void;
}

const MessengerApp: React.FC<MessengerAppProps> = ({ onLogout }) => {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'John Doe',
      phone: '+1234567890',
      lastMessage: 'Hola, ¿cómo estás?',
      timestamp: '10:45',
      unread: true
    }
  ]);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      contactId: '1',
      text: 'Hola, ¿cómo estás?',
      sent: false,
      timestamp: '10:45'
    }
  ]);
  
  const [view, setView] = useState<'list' | 'conversation' | 'new'>('list');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  
  const handleSelectContact = (contactId: string) => {
    setSelectedContactId(contactId);
    setView('conversation');
    
    // Mark messages as read
    setContacts(contacts.map(contact => 
      contact.id === contactId ? { ...contact, unread: false } : contact
    ));
  };
  
  const handleSendMessage = (text: string) => {
    if (!selectedContactId) return;
    
    const now = new Date();
    const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newMessage: Message = {
      id: uuidv4(),
      contactId: selectedContactId,
      text,
      sent: true,
      timestamp
    };
    
    setMessages([...messages, newMessage]);
    
    // Update last message and timestamp in contact
    setContacts(contacts.map(contact => 
      contact.id === selectedContactId 
        ? { ...contact, lastMessage: text, timestamp } 
        : contact
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
  
  const handleBack = () => {
    if (view === 'conversation' || view === 'new') {
      setView('list');
      setSelectedContactId(null);
    } else {
      onLogout();
    }
  };
  
  // Get the selected contact
  const selectedContact = contacts.find(contact => contact.id === selectedContactId);
  
  // Get messages for the selected contact
  const contactMessages = messages.filter(
    message => message.contactId === selectedContactId
  );

  return (
    <div className="h-full">
      {view === 'list' && (
        <ChatList 
          contacts={contacts}
          onSelectContact={handleSelectContact}
          onNewChat={() => setView('new')}
          onBack={onLogout}
        />
      )}
      
      {view === 'conversation' && selectedContact && (
        <ChatConversation 
          contactName={selectedContact.name}
          messages={contactMessages}
          onSendMessage={handleSendMessage}
          onBack={() => setView('list')}
        />
      )}
      
      {view === 'new' && (
        <NewChat 
          onCreateChat={handleCreateChat}
          onCancel={() => setView('list')}
        />
      )}
    </div>
  );
};

export default MessengerApp;
