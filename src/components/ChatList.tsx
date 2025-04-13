
import React from 'react';
import { ArrowLeft, LogOut, Plus, UserPlus, Bell, BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  phone?: string;
  fullName?: string | null;
  notes?: string | null;
  hasCustomLock?: boolean;
}

interface ChatListProps {
  username: string;
  contacts: Contact[];
  onSelectContact: (id: string) => void;
  onNewChat: () => void;
  onShowRequests: () => void;
  onShowDirectory: () => void;
  hasPendingRequests: boolean;
  onBack: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ 
  username,
  contacts, 
  onSelectContact, 
  onNewChat,
  onShowRequests,
  onShowDirectory,
  hasPendingRequests,
  onBack 
}) => {
  const { t } = useLanguage();
  
  const handleCopyUsername = () => {
    navigator.clipboard.writeText(username);
    // Podríamos añadir un toast aquí para confirmar copia
  };

  return (
    <div className="flex flex-col h-full bg-messenger-background">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="mr-3 p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold">dScrt</h1>
            <div className="flex items-center">
              <p className="text-xs text-gray-500 mr-2">@{username}</p>
              <button 
                onClick={handleCopyUsername} 
                className="text-xs text-blue-500"
              >
                Copiar
              </button>
            </div>
          </div>
        </div>
        <div className="flex">
          <button 
            onClick={onShowRequests}
            className="p-2 mr-2 rounded-full hover:bg-gray-200 transition-colors relative"
          >
            <Bell size={20} />
            {hasPendingRequests && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                !
              </span>
            )}
          </button>
          <button 
            onClick={onShowDirectory} 
            className="p-2 mr-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <BookOpen size={20} />
          </button>
          <button 
            onClick={onNewChat}
            className="p-2 rounded-full bg-messenger-primary text-white hover:bg-messenger-secondary transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
            <UserPlus size={48} className="mb-4 text-gray-400" />
            <p className="text-center">{t('no_conversations')}</p>
            <p className="text-sm text-center text-gray-400 mt-2">
              {t('share_username')}
            </p>
            <button 
              onClick={onNewChat}
              className="mt-4 px-4 py-2 bg-messenger-primary text-white rounded-lg hover:bg-messenger-secondary transition-colors"
            >
              {t('new_message')}
            </button>
          </div>
        ) : (
          contacts.map((contact) => (
            <div 
              key={contact.id}
              onClick={() => onSelectContact(contact.id)}
              className="flex items-center p-4 hover:bg-gray-100 cursor-pointer border-b"
            >
              <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-medium mr-3">
                {contact.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{contact.name}</span>
                  <span className="text-xs text-gray-500">{contact.timestamp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 truncate max-w-[200px]">{contact.lastMessage}</span>
                  {contact.unread && <div className="h-5 w-5 rounded-full bg-messenger-primary flex items-center justify-center text-xs text-white">!</div>}
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
