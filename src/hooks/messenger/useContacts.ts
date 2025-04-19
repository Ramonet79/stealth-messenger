
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Contact } from '@/components/Messenger/types';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { patternService } from '@/services/patternService';

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
      console.log("Buscando usuario para crear chat:", contactUsername);
      
      // Primera búsqueda: exacta
      let { data: foundProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', contactUsername)
        .maybeSingle();
      
      // Si no se encontró, intentar búsqueda case-insensitive
      if (!foundProfile) {
        console.log("No se encontró con búsqueda exacta, intentando case-insensitive");
        
        const { data: insensitiveResults, error: insensitiveError } = await supabase
          .from('profiles')
          .select('id, username')
          .ilike('username', contactUsername)
          .limit(1);
          
        if (insensitiveError) {
          console.error("Error en búsqueda case-insensitive:", insensitiveError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Error al buscar el contacto",
          });
          return null;
        }
        
        if (insensitiveResults && insensitiveResults.length > 0) {
          foundProfile = insensitiveResults[0];
          console.log("Usuario encontrado con búsqueda case-insensitive:", foundProfile);
        }
      }
      
      if (!foundProfile) {
        console.error("No se pudo encontrar el perfil del contacto tras múltiples intentos");
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo encontrar el contacto especificado",
        });
        return null;
      }
      
      console.log("Contacto encontrado:", foundProfile);
      
      // Verificar si el contacto ya existe
      const { data: existingContact, error: existingError } = await supabase
        .from('contacts')
        .select('id')
        .eq('user_id', user.id)
        .eq('contact_id', foundProfile.id)
        .single();
        
      if (!existingError && existingContact) {
        console.log("Este contacto ya existe en la agenda:", existingContact);
        toast({
          variant: "destructive",
          title: "Contacto duplicado",
          description: "Este contacto ya existe en tu agenda",
        });
        return existingContact.id;
      }
      
      // Crear nuevo contacto
      const { data: newContactData, error: contactError } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          contact_id: foundProfile.id,
          name: contactAlias,
          full_name: foundProfile.username
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
        return null;
      }
      
      console.log("Contacto creado exitosamente:", newContactData);
      
      const now = new Date();
      const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const newContact: Contact = {
        id: newContactData.id,
        name: contactAlias,
        phone: '',
        lastMessage: 'Nuevo contacto',
        timestamp,
        unread: false,
        fullName: foundProfile.username
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
