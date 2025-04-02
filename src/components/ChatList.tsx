
import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, Bell, BookOpen, LogOut } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';

interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

interface ChatListProps {
  username: string;
  contacts: Contact[];
  onSelectContact: (contactId: string) => void;
  onNewChat: () => void;
  onShowRequests: () => void;
  onShowDirectory: () => void;
  hasPendingRequests: boolean;
  onBack: () => void;
}

const ChatList = ({
  username,
  contacts,
  onSelectContact,
  onNewChat,
  onShowRequests,
  onShowDirectory,
  hasPendingRequests,
  onBack
}: ChatListProps) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    document.title = 'dScrt'; // Set the page title
  }, []);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-lg font-medium">{t('messages') || 'Mensajes'}</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onShowRequests}
            className="relative p-2 rounded-full hover:bg-gray-100"
          >
            <Bell size={24} />
            {hasPendingRequests && (
              <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[0.6rem] bg-red-500">
                !
              </Badge>
            )}
          </button>
          <button 
            onClick={onShowDirectory}
            className="p-2 rounded-full hover:bg-gray-100"
            title={t('contacts.directory') || 'Agenda dScrt'}
          >
            <BookOpen size={24} />
          </button>
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <LogOut size={24} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t('search') || 'Buscar'}
            className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-messenger-primary focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Contacts list */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length > 0 ? (
          <div className="divide-y">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="p-3 flex items-start hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectContact(contact.id)}
              >
                {/* Contact avatar (placeholder circle) */}
                <div className="w-12 h-12 rounded-full bg-messenger-primary text-white flex items-center justify-center mr-3">
                  {contact.name[0].toUpperCase()}
                </div>

                {/* Contact details */}
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className={`${contact.unread ? 'font-medium' : ''}`}>{contact.name}</h3>
                    <span className="text-xs text-gray-500">{contact.timestamp}</span>
                  </div>
                  <p
                    className={`text-sm truncate max-w-[230px] ${
                      contact.unread ? 'text-black font-medium' : 'text-gray-500'
                    }`}
                  >
                    {contact.lastMessage}
                  </p>
                </div>

                {/* Unread indicator */}
                {contact.unread && (
                  <div className="ml-2 w-3 h-3 rounded-full bg-messenger-primary self-center"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="mb-4">{t('no_conversations') || 'No hay conversaciones'}</p>
          </div>
        )}
      </div>

      {/* New chat button */}
      <div className="p-4 border-t flex justify-center">
        <button
          onClick={onNewChat}
          className="flex items-center px-4 py-2 bg-messenger-primary text-white rounded-full hover:bg-messenger-secondary transition-colors"
        >
          <PlusCircle className="mr-2" size={20} />
          {t('new_chat') || 'Nueva conversación'}
        </button>
      </div>
    </div>
  );
};

export default ChatList;
