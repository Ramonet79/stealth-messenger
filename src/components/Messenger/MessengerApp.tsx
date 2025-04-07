
import React from 'react';
import ChatList from './ChatList';
import ChatConversation from './ChatConversation';
import NewChat from './NewChat';
import RequestsList from './RequestsList';
import ContactDirectory from './ContactDirectory';
import ContactLockPattern from './ContactLockPattern';
import PatternLock from '@/components/PatternLock';
import { useMessengerState } from './useMessengerState';
import { AppView } from './types';

interface MessengerAppProps {
  onLogout: () => void;
  onUnreadMessagesChange?: (hasUnread: boolean) => void;
}

const MessengerApp: React.FC<MessengerAppProps> = ({ onLogout, onUnreadMessagesChange }) => {
  const {
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
  } = useMessengerState(onUnreadMessagesChange);

  const handleBack = () => {
    if (view === 'conversation' || view === 'new' || view === 'requests' || view === 'directory' || view === 'contactLock') {
      setView('list');
      setSelectedContactId(null);
    } else {
      onLogout();
    }
  };
  
  const selectedContact = contacts.find(contact => contact.id === selectedContactId);
  
  const contactMessages = messages.filter(
    message => message.contactId === selectedContactId
  );
  
  const hasPendingRequests = pendingRequests.some(req => req.status === 'pending');

  return (
    <div className="h-screen bg-gray-100">
      {view === 'list' && (
        <ChatList 
          username={username}
          contacts={contacts}
          onSelectContact={handleSelectContact}
          onNewChat={() => setView('new')}
          onShowRequests={() => setView('requests')}
          onShowDirectory={() => setView('directory')}
          hasPendingRequests={hasPendingRequests}
          onBack={onLogout}
        />
      )}
      
      {view === 'conversation' && selectedContact && (
        <ChatConversation 
          contactName={selectedContact.name}
          contactId={selectedContact.id}
          messages={contactMessages}
          onSendMessage={handleSendMessage}
          onBack={handleBack}
          onOpenContactSettings={(id) => {
            setSelectedContactId(id);
            setView('directory');
          }}
          onOpenContactLock={(id) => {
            setSelectedContactId(id);
            setView('contactLock');
          }}
          hasCustomLock={selectedContact.hasCustomLock}
        />
      )}
      
      {view === 'new' && (
        <NewChat 
          onCreateChat={handleCreateChat}
          onCancel={handleBack}
          onBack={handleBack}
        />
      )}
      
      {view === 'requests' && (
        <RequestsList 
          requests={pendingRequests.filter(req => req.status === 'pending')}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
          onBlock={handleBlockRequest}
          onBack={handleBack}
        />
      )}
      
      {view === 'directory' && (
        <ContactDirectory 
          contacts={contacts}
          onBack={handleBack}
          onEditContact={handleEditContact}
          onDeleteContact={handleDeleteContact}
        />
      )}
      
      {view === 'contactLock' && selectedContact && (
        <ContactLockPattern 
          contactId={selectedContact.id}
          contactName={selectedContact.name}
          onSavePattern={handleSaveContactPattern}
          onBack={handleBack}
          isEnabled={selectedContact.hasCustomLock}
        />
      )}
      
      {showPatternLock && (
        <div className="fixed inset-0 bg-white z-10">
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-xl font-medium mb-8">
              Introduce el patrón para desbloquear el chat con {selectedContact?.name}
            </h2>
            <PatternLock onPatternComplete={handlePatternComplete} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessengerApp;
