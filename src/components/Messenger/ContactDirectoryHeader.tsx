
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContactDirectoryHeaderProps {
  onBack: () => void;
}

const ContactDirectoryHeader: React.FC<ContactDirectoryHeaderProps> = ({ onBack }) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center p-4 bg-white border-b shadow-sm">
      <button
        onClick={onBack}
        className="mr-3 p-2 rounded-full hover:bg-gray-100"
        aria-label={t('back')}
      >
        <ArrowLeft size={20} />
      </button>
      <h1 className="text-lg font-medium">{t('contacts.directory') || 'Agenda dScrt'}</h1>
    </div>
  );
};

export default ContactDirectoryHeader;
