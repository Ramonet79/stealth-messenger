
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContactSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const ContactSearchBar: React.FC<ContactSearchBarProps> = ({ 
  searchTerm, 
  onSearchChange 
}) => {
  const { t } = useLanguage();

  return (
    <div className="p-3 bg-white border-b">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
        <Input 
          type="text" 
          placeholder={t('contacts.search') || 'Buscar contactos...'}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-full"
        />
      </div>
    </div>
  );
};

export default ContactSearchBar;
