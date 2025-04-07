
import React from 'react';
import ConversationHeader from './ConversationHeader';
import ConversationMessageList from './ConversationMessageList';
import ConversationInput from './ConversationInput';
import { Message } from './types';

interface ChatConversationProps {
  contactName: string;
  contactId: string;
  messages: Message[];
  onSendMessage: (text: string, type?: 'text' | 'image' | 'audio' | 'video', mediaUrl?: string) => void;
  onBack: () => void;
  onOpenContactSettings?: (contactId: string) => void;
  onOpenContactLock?: (contactId: string) => void;
  hasCustomLock?: boolean;
}

const ChatConversation: React.FC<ChatConversationProps> = ({
  contactName,
  contactId,
  messages,
  onSendMessage,
  onBack,
  onOpenContactSettings,
  onOpenContactLock,
  hasCustomLock = false
}) => {
  return (
    <div className="flex flex-col h-full bg-messenger-background">
      <ConversationHeader 
        contactName={contactName}
        contactId={contactId}
        onBack={onBack}
        onOpenContactSettings={onOpenContactSettings}
        onOpenContactLock={onOpenContactLock}
        hasCustomLock={hasCustomLock}
      />
      
      <ConversationMessageList messages={messages} />
      
      <ConversationInput onSendMessage={onSendMessage} />
    </div>
  );
};

export default ChatConversation;
