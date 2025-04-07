
import React from 'react';
import { ArrowLeft, Lock, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ConversationHeaderProps {
  contactName: string;
  contactId: string;
  onBack: () => void;
  onOpenContactSettings?: (contactId: string) => void;
  onOpenContactLock?: (contactId: string) => void;
  hasCustomLock?: boolean;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  contactName,
  contactId,
  onBack,
  onOpenContactSettings,
  onOpenContactLock,
  hasCustomLock = false
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center">
        <button
          onClick={onBack}
          className="mr-3 p-2 rounded-full hover:bg-gray-200 transition-colors"
          aria-label={t('back')}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="font-medium">{contactName}</h2>
        </div>
      </div>
      
      <div className="flex space-x-1">
        {onOpenContactLock && (
          <button 
            onClick={() => onOpenContactLock(contactId)}
            className={`p-2 rounded-full ${hasCustomLock ? 'text-messenger-primary' : 'text-gray-500'} hover:bg-gray-100`}
            title={t('contactLock.title') || "Patrón de desbloqueo"}
          >
            <Lock size={20} />
          </button>
        )}
        
        {onOpenContactSettings && (
          <button 
            onClick={() => onOpenContactSettings(contactId)}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
            title={t('contactSettings.title') || "Ajustes de contacto"}
          >
            <Settings size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ConversationHeader;
