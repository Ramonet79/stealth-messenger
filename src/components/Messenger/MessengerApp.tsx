import React, { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatConversation from './ChatConversation';
import NewChat from './NewChat';
import RequestsList from './RequestsList';
import ContactLockPattern from './ContactLockPattern';
import ContactDirectory from './ContactDirectory';
import { AppView } from './types';
import { useMessengerState } from '@/hooks/messenger/useMessengerState';
import PrivacyNotice from './PrivacyNotice';
import PatternLock from '@/components/PatternLock';

interface MessengerAppProps {
  onLogout: () => void;
  onUnreadMessagesChange?: (hasUnread: boolean) => void;
  onViewChange?: (view: string) => void;
}

const MessengerApp: React.FC<MessengerAppProps> = ({ 
  onLogout, 
  onUnreadMessagesChange,
  onViewChange 
}) => {
  const [privacyNotice, setPrivacyNotice] = useState({
    hasSeenMediaPrivacyNotice: localStorage.getItem('dscrt-media-privacy-notice-seen') === 'true',
    showMediaPrivacyNotice: false
  });
  
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

  useEffect(() => {
    if (onViewChange) {
      onViewChange(view);
    }
  }, [view, onViewChange]);
  
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

  const showMediaPrivacyNotice = () => {
    if (!privacyNotice.hasSeenMediaPrivacyNotice) {
      setPrivacyNotice({
        ...privacyNotice,
        showMediaPrivacyNotice: true
      });
    }
  };

  const handleClosePrivacyNotice = () => {
    localStorage.setItem('dscrt-media-privacy-notice-seen', 'true');
    setPrivacyNotice({
      hasSeenMediaPrivacyNotice: true,
      showMediaPrivacyNotice: false
    });
  };

  const handleSendMessageWithPrivacyCheck = (text: string, type?: 'text' | 'image' | 'audio' | 'video', mediaUrl?: string) => {
    if (type && type !== 'text' && !privacyNotice.hasSeenMediaPrivacyNotice) {
      showMediaPrivacyNotice();
      sessionStorage.setItem('pending-message', JSON.stringify({ text, type, mediaUrl }));
    } else {
      handleSendMessage(text, type, mediaUrl);
    }
  };

  useEffect(() => {
    if (privacyNotice.hasSeenMediaPrivacyNotice) {
      const pendingMessage = sessionStorage.getItem('pending-message');
      if (pendingMessage) {
        const { text, type, mediaUrl } = JSON.parse(pendingMessage);
        handleSendMessage(text, type, mediaUrl);
        sessionStorage.removeItem('pending-message');
      }
    }
  }, [privacyNotice.hasSeenMediaPrivacyNotice]);

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
          onSendMessage={handleSendMessageWithPrivacyCheck}
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
      
      {privacyNotice.showMediaPrivacyNotice && (
        <PrivacyNotice onClose={handleClosePrivacyNotice} />
      )}
      
      {showPatternLock && (
        <div className="fixed inset-0 bg-white z-10">
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-xl font-medium mb-8">
              Introduce el patrón para desbloquear el chat con {selectedContact?.name}
            </h2>
            <PatternLock onPatternComplete={handlePatternComplete} isCreationMode={false} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessengerApp;
