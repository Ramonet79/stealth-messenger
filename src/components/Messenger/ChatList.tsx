
import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

interface ChatListProps {
  contacts: Contact[];
  onSelectContact: (id: string) => void;
  onNewChat: () => void;
  onBack: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ 
  contacts, 
  onSelectContact, 
  onNewChat,
  onBack 
}) => {
  return (
    <div className="flex flex-col h-full bg-messenger-background">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="mr-3 p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">Mensajes</h1>
        </div>
        <button 
          onClick={onNewChat}
          className="p-2 rounded-full bg-messenger-primary text-white hover:bg-messenger-secondary transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No tienes conversaciones</p>
            <button 
              onClick={onNewChat}
              className="mt-4 px-4 py-2 bg-messenger-primary text-white rounded-lg hover:bg-messenger-secondary transition-colors"
            >
              Nuevo mensaje
            </button>
          </div>
        ) : (
          contacts.map((contact) => (
            <div 
              key={contact.id}
              onClick={() => onSelectContact(contact.id)}
              className="flex items-center p-4 hover:bg-gray-100 cursor-pointer border-b"
            >
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-medium mr-3">
                {contact.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{contact.name}</span>
                  <span className="text-xs text-gray-500">{contact.timestamp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 truncate max-w-[200px]">{contact.lastMessage}</span>
                  {contact.unread && <div className="h-2 w-2 rounded-full bg-messenger-primary"></div>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
