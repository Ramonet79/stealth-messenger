
import React, { useRef, useEffect } from 'react';
import ConversationMessage from './ConversationMessage';
import { Message } from './types';

interface ConversationMessageListProps {
  messages: Message[];
}

const ConversationMessageList: React.FC<ConversationMessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-messenger-background">
      {messages.map((message) => (
        <ConversationMessage key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ConversationMessageList;
