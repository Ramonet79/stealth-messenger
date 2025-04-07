
import React from 'react';
import { User, Edit2, Trash } from 'lucide-react';
import { Contact } from './types';

interface ContactItemProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

const ContactItem: React.FC<ContactItemProps> = ({ contact, onEdit, onDelete }) => {
  return (
    <div className="flex justify-between items-center p-4 bg-white hover:bg-gray-50">
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
          onClick={() => onEdit(contact)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
          aria-label="Edit contact"
        >
          <Edit2 size={18} />
        </button>
        <button 
          onClick={() => onDelete(contact.id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-full"
          aria-label="Delete contact"
        >
          <Trash size={18} />
        </button>
      </div>
    </div>
  );
};

export default ContactItem;
