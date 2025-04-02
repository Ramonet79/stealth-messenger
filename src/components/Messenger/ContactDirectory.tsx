
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, User, Search, Edit2, Trash, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Contact {
  id: string;
  name: string;
  lastMessage?: string;
  timestamp?: string;
  unread?: boolean;
  phone?: string;
  fullName?: string | null;
  notes?: string | null;
  hasCustomLock?: boolean;
}

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

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.fullName && contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setEditForm({
      name: contact.name,
      fullName: contact.fullName || '',
      notes: contact.notes || ''
    });
    setIsEditing(true);
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
      {/* Header */}
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
      
      {/* Search bar */}
      <div className="p-3 bg-white border-b">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <Input 
            type="text" 
            placeholder={t('contacts.search') || 'Buscar contactos...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>
      
      {/* Contacts list */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length > 0 ? (
          <div className="divide-y">
            {filteredContacts.map(contact => (
              <div key={contact.id} className="flex justify-between items-center p-4 bg-white hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-messenger-primary text-white flex items-center justify-center mr-3">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium">{contact.name}</h3>
                    {contact.fullName && <p className="text-sm text-gray-500">{contact.fullName}</p>}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(contact)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <User size={48} strokeWidth={1} />
            <p className="mt-2 text-center">
              {searchTerm 
                ? t('contacts.noResults') || 'No se encontraron contactos'
                : t('contacts.empty') || 'No hay contactos en tu agenda'}
            </p>
          </div>
        )}
      </div>
      
      {/* Edit Contact Dialog */}
      <Dialog open={isEditing} onOpenChange={(open) => !open && setIsEditing(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('contacts.edit') || 'Editar contacto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('contacts.username') || 'Nombre de usuario'}
              </label>
              <Input 
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('contacts.fullName') || 'Nombre completo'}
              </label>
              <Input 
                value={editForm.fullName}
                onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('contacts.notes') || 'Notas'}
              </label>
              <Textarea 
                value={editForm.notes}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              {t('cancel') || 'Cancelar'}
            </Button>
            <Button onClick={handleSaveEdit}>
              {t('save') || 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactDirectory;
