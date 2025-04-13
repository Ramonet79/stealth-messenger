
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Contact } from '@/components/Messenger/types';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'John Doe',
      phone: '+1234567890',
      lastMessage: 'Hola, ¿cómo estás?',
      timestamp: '10:45',
      unread: true
    },
    {
      id: '2',
      name: 'María García',
      phone: '+34612345678',
      lastMessage: '¿Te llegaron los archivos que envié?',
      timestamp: 'Ayer',
      unread: false
    },
    {
      id: '3',
      name: 'Alex Smith',
      phone: '+44712345678',
      lastMessage: 'Ok, nos vemos mañana entonces.',
      timestamp: 'Lun',
      unread: false
    }
  ]);
  
  const [contactsWithActiveLock, setContactsWithActiveLock] = useState<string[]>([]);
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  useEffect(() => {
    const checkContactsWithLock = async () => {
      if (!user) return;
      
      const activeLocksIds: string[] = [];
      
      for (const contact of contacts) {
        try {
          const hasLock = await patternService.contactHasActivePattern(user.id, contact.id);
          if (hasLock) {
            activeLocksIds.push(contact.id);
          }
        } catch (error) {
          console.error("Error checking contact lock status:", error);
        }
      }
      
      setContactsWithActiveLock(activeLocksIds);
      
      setContacts(contacts.map(contact => ({
        ...contact,
        hasCustomLock: activeLocksIds.includes(contact.id)
      })));
    };
    
    checkContactsWithLock();
  }, [user]);

  const handleCreateChat = async (contactUsername: string, contactAlias: string) => {
    if (!user) return;
    
    try {
      const { data: contactProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', contactUsername)
        .single();
      
      if (profileError || !contactProfile) {
        console.error("Error al buscar el perfil del contacto:", profileError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo encontrar el contacto especificado",
        });
        return;
      }
      
      const { data: newContactData, error: contactError } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          contact_id: contactProfile.id,
          name: contactAlias,
          full_name: contactUsername
        })
        .select()
        .single();
      
      if (contactError || !newContactData) {
        console.error("Error al crear contacto:", contactError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo crear el contacto",
        });
        return;
      }
      
      const now = new Date();
      const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const newContact: Contact = {
        id: newContactData.id,
        name: contactAlias,
        phone: '',
        lastMessage: 'Nuevo contacto',
        timestamp,
        unread: false,
        fullName: contactUsername
      };
      
      setContacts([newContact, ...contacts]);
      
      toast({
        title: "Contacto creado",
        description: `Has añadido a ${contactAlias} como contacto`,
      });

      return newContact.id;
    } catch (error) {
      console.error("Error inesperado al crear contacto:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el contacto",
      });
      return null;
    }
  };

  const handleEditContact = (contactId: string, data: Partial<Contact>) => {
    setContacts(contacts.map(contact =>
      contact.id === contactId ? { ...contact, ...data } : contact
    ));
    
    toast({
      title: "Contacto actualizado",
      description: "La información del contacto ha sido actualizada",
    });
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts(contacts.filter(contact => contact.id !== contactId));
    
    toast({
      title: "Contacto eliminado",
      description: "El contacto ha sido eliminado de tu agenda",
    });

    return contacts.filter(contact => contact.id !== contactId);
  };

  const updateContactMessage = (contactId: string, message: string, timestamp: string, unread: boolean = false) => {
    setContacts(prevContacts => 
      prevContacts.map(contact => 
        contact.id === contactId ? 
        {
          ...contact,
          lastMessage: message,
          timestamp,
          unread
        } : contact
      )
    );
  };

  const markContactAsRead = (contactId: string) => {
    setContacts(contacts.map(contact => 
      contact.id === contactId ? { ...contact, unread: false } : contact
    ));
  };

  return {
    contacts,
    setContacts,
    contactsWithActiveLock,
    setContactsWithActiveLock,
    handleCreateChat,
    handleEditContact,
    handleDeleteContact,
    updateContactMessage,
    markContactAsRead
  };
};
