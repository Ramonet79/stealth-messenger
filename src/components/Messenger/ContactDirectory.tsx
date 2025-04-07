
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Contact } from './types';
import ContactDirectoryHeader from './ContactDirectoryHeader';
import ContactSearchBar from './ContactSearchBar';
import ContactList from './ContactList';
import ContactEditDialog from './ContactEditDialog';

interface ContactDirectoryProps {
  contacts: Contact[];
  onBack: () => void;
  onEditContact: (id: string, data: Partial<Contact>) => void;
  onDeleteContact: (id: string) => void;
}

const ContactDirectory: React.FC<ContactDirectoryProps> = ({ 
  contacts, 
  onBack, 
  onEditContact, 
  onDeleteContact 
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: '',
    fullName: '',
    notes: ''
  });

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setEditForm({
      name: contact.name,
      fullName: contact.fullName || '',
      notes: contact.notes || ''
    });
    setIsEditing(true);
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm({
      ...editForm,
      [field]: value
    });
  };

  const handleSaveEdit = () => {
    if (selectedContact) {
      onEditContact(selectedContact.id, {
        name: editForm.name,
        fullName: editForm.fullName || null,
        notes: editForm.notes || null
      });
      setIsEditing(false);
      setSelectedContact(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(t('contacts.confirmDelete') || '¿Estás seguro de que quieres eliminar este contacto?')) {
      onDeleteContact(id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <ContactDirectoryHeader onBack={onBack} />
      <ContactSearchBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <div className="flex-1 overflow-y-auto">
        <ContactList 
          contacts={contacts}
          searchTerm={searchTerm}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      <ContactEditDialog
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        editForm={editForm}
        onEditFormChange={handleEditFormChange}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default ContactDirectory;
