
import React from 'react';
import { User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ContactItem from './ContactItem';
import { Contact } from './types';

interface ContactListProps {
  contacts: Contact[];
  searchTerm: string;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

const ContactList: React.FC<ContactListProps> = ({ 
  contacts, 
  searchTerm, 
  onEdit, 
  onDelete 
}) => {
  const { t } = useLanguage();
  
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.fullName && contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (filteredContacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
        <User size={48} strokeWidth={1} />
        <p className="mt-2 text-center">
          {searchTerm 
            ? t('contacts.noResults') || 'No se encontraron contactos'
            : t('contacts.empty') || 'No hay contactos en tu agenda'}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {filteredContacts.map(contact => (
        <ContactItem 
          key={contact.id} 
          contact={contact} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
};

export default ContactList;
