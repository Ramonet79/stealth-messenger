
import React, { useState } from 'react';
import ChatList from './ChatList';
import ChatConversation from './ChatConversation';
import NewChat from './NewChat';
import RequestsList from './RequestsList';
import { Settings, UserPlus } from 'lucide-react';
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
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'audio';
  mediaUrl?: string;
}

interface Request {
  id: string;
  username: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
}

export type AppView = 'list' | 'conversation' | 'new' | 'requests' | 'settings';

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
  
  const handleSelectContact = (contactId: string) => {
    setSelectedContactId(contactId);
    setView('conversation');
    
    // Mark messages as read
    setContacts(contacts.map(contact => 
      contact.id === contactId ? { ...contact, unread: false } : contact
    ));
    
    // Update message status
    setMessages(messages.map(message =>
      message.contactId === contactId && !message.sent 
        ? { ...message, status: 'read' } 
        : message
    ));
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
    
    // Update last message and timestamp in contact
    setContacts(contacts.map(contact => 
      contact.id === selectedContactId 
        ? { ...contact, lastMessage: type === 'text' ? text : type === 'image' ? '📷 Imagen' : '🎤 Audio', timestamp } 
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
  
  const handleAcceptRequest = (requestId: string) => {
    const request = pendingRequests.find(req => req.id === requestId);
    
    if (request) {
      // Create new contact from request
      const now = new Date();
      const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const newContact: Contact = {
        id: uuidv4(),
        name: request.username,
        phone: '', // No phone number for username-based contacts
        lastMessage: 'Contacto añadido',
        timestamp,
        unread: false
      };
      
      setContacts([newContact, ...contacts]);
      
      // Update request status
      setPendingRequests(pendingRequests.map(req => 
        req.id === requestId ? { ...req, status: 'accepted' } : req
      ));
    }
  };
  
  const handleRejectRequest = (requestId: string) => {
    setPendingRequests(pendingRequests.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' } : req
    ));
  };
  
  const handleBlockRequest = (requestId: string) => {
    setPendingRequests(pendingRequests.map(req => 
      req.id === requestId ? { ...req, status: 'blocked' } : req
    ));
  };
  
  const handleBack = () => {
    if (view === 'conversation' || view === 'new' || view === 'requests' || view === 'settings') {
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
  
  // Has pending requests
  const hasPendingRequests = pendingRequests.some(req => req.status === 'pending');

  return (
    <div className="h-full bg-gray-100">
      {view === 'list' && (
        <ChatList 
          username={username}
          contacts={contacts}
          onSelectContact={handleSelectContact}
          onNewChat={() => setView('new')}
          onShowRequests={() => setView('requests')}
          hasPendingRequests={hasPendingRequests}
          onBack={onLogout}
        />
      )}
      
      {view === 'conversation' && selectedContact && (
        <ChatConversation 
          contactName={selectedContact.name}
          messages={contactMessages}
          onSendMessage={handleSendMessage}
          onBack={handleBack}
        />
      )}
      
      {view === 'new' && (
        <NewChat 
          onCreateChat={handleCreateChat}
          onCancel={() => setView('list')}
        />
      )}
      
      {view === 'requests' && (
        <RequestsList
          requests={pendingRequests.filter(req => req.status === 'pending')}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
          onBlock={handleBlockRequest}
          onBack={() => setView('list')}
        />
      )}
    </div>
  );
};

export default MessengerApp;
