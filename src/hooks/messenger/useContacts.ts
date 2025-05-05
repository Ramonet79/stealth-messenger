import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/components/Messenger/types';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { patternService } from '@/services/patternService';

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsWithActiveLock, setContactsWithActiveLock] = useState<string[]>([]);
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  // Cargar contactos desde Supabase
  const loadContacts = useCallback(async () => {
    if (!user) return;

    try {
      console.log("Cargando contactos para usuario:", user.id);
      
      // Obtener contactos desde la tabla de contactos
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error("Error al cargar contactos:", error);
        return;
      }

      // Transformar los datos de la base de datos al formato de Contact
      const formattedContacts: Contact[] = data.map(contact => ({
        id: contact.id,
        name: contact.name,
        phone: contact.phone || '',
        lastMessage: contact.last_message || 'Sin mensajes',
        timestamp: contact.last_message_time || '00:00',
        unread: contact.unread || false,
        fullName: contact.full_name || null,
        notes: contact.notes || null,
        hasCustomLock: contact.has_custom_lock || false
      }));

      console.log("Contactos cargados:", formattedContacts.length);
      setContacts(formattedContacts);
      
      // Cargar contactos con patrón personalizado
      loadContactsWithLock(formattedContacts);
    } catch (err) {
      console.error("Error inesperado al cargar contactos:", err);
    }
  }, [user]);

  // Cargar contactos que tienen patrón personalizado
  const loadContactsWithLock = async (contactsList: Contact[]) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('contact_patterns')
        .select('contact_id')
        .eq('user_id', user.id);
        
      if (error) {
        console.error("Error al cargar patrones de contactos:", error);
        return;
      }
      
      const contactsWithLock = data.map(item => item.contact_id);
      console.log("Contactos con patrón personalizado:", contactsWithLock);
      setContactsWithActiveLock(contactsWithLock);
    } catch (err) {
      console.error("Error al cargar contactos con patrón:", err);
    }
  };

  // Cargar contactos al iniciar
  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user, loadContacts]);

  // Crear un nuevo chat
  const handleCreateChat = async (contactName: string, username: string) => {
    if (!user) return null;
    
    try {
      // Verificar si ya existe un contacto con ese nombre
      const existingContact = contacts.find(
        contact => contact.name.toLowerCase() === contactName.toLowerCase()
      );
      
      if (existingContact) {
        toast({
          title: "Contacto existente",
          description: `Ya tienes un chat con ${contactName}`,
        });
        return existingContact;
      }
      
      // Crear un nuevo contacto
      const now = new Date();
      const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const newContact: Contact = {
        id: uuidv4(),
        name: contactName,
        phone: '',
        lastMessage: 'Nuevo chat creado',
        timestamp,
        unread: false
      };
      
      // Guardar en Supabase
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          id: newContact.id,
          user_id: user.id,
          name: contactName,
          username: username,
          last_message: newContact.lastMessage,
          last_message_time: timestamp,
          unread: false
        })
        .select();
        
      if (error) {
        console.error("Error al crear contacto:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo crear el chat",
        });
        return null;
      }
      
      // Actualizar estado local
      setContacts(prev => [...prev, newContact]);
      
      toast({
        title: "Chat creado",
        description: `Se ha creado un nuevo chat con ${contactName}`,
      });
      
      return newContact;
    } catch (err) {
      console.error("Error al crear chat:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al crear el chat",
      });
      return null;
    }
  };

  // Editar un contacto existente
  const handleEditContact = async (id: string, data: Partial<Contact>) => {
    if (!user) return;
    
    try {
      // Actualizar en Supabase
      const { error } = await supabase
        .from('contacts')
        .update({
          name: data.name,
          full_name: data.fullName,
          notes: data.notes
        })
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        console.error("Error al actualizar contacto:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo actualizar el contacto",
        });
        return;
      }
      
      // Actualizar estado local
      setContacts(prev => prev.map(contact => 
        contact.id === id ? { ...contact, ...data } : contact
      ));
      
      toast({
        title: "Contacto actualizado",
        description: "Los datos del contacto se han actualizado correctamente",
      });
    } catch (err) {
      console.error("Error al editar contacto:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al actualizar el contacto",
      });
    }
  };

  // Eliminar un contacto
  const handleDeleteContact = async (id: string) => {
    if (!user) return;
    
    try {
      // Eliminar de Supabase
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        console.error("Error al eliminar contacto:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar el contacto",
        });
        return;
      }
      
      // Eliminar también los patrones asociados si existen
      await supabase
        .from('contact_patterns')
        .delete()
        .eq('contact_id', id)
        .eq('user_id', user.id);
      
      // Actualizar estado local
      setContacts(prev => prev.filter(contact => contact.id !== id));
      setContactsWithActiveLock(prev => prev.filter(contactId => contactId !== id));
      
      toast({
        title: "Contacto eliminado",
        description: "El contacto ha sido eliminado correctamente",
      });
    } catch (err) {
      console.error("Error al eliminar contacto:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al eliminar el contacto",
      });
    }
  };

  // Actualizar el último mensaje de un contacto
  const updateContactMessage = (contactId: string, message: string, type: string = 'text') => {
    const now = new Date();
    const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Formatear el mensaje según el tipo
    let displayMessage = message;
    if (type === 'image') displayMessage = '📷 Imagen';
    if (type === 'audio') displayMessage = '🎵 Audio';
    if (type === 'video') displayMessage = '🎬 Video';
    
    // Actualizar en Supabase
    if (user) {
      supabase
        .from('contacts')
        .update({
          last_message: displayMessage,
          last_message_time: timestamp,
          unread: true
        })
        .eq('id', contactId)
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) {
            console.error("Error al actualizar último mensaje:", error);
          }
        });
    }
    
    // Actualizar estado local
    setContacts(prev => prev.map(contact => 
      contact.id === contactId 
        ? { 
            ...contact, 
            lastMessage: displayMessage, 
            timestamp, 
            unread: true 
          } 
        : contact
    ));
  };

  // Marcar un contacto como leído
  const markContactAsRead = (contactId: string) => {
    // Actualizar en Supabase
    if (user) {
      supabase
        .from('contacts')
        .update({ unread: false })
        .eq('id', contactId)
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) {
            console.error("Error al marcar contacto como leído:", error);
          }
        });
    }
    
    // Actualizar estado local
    setContacts(prev => prev.map(contact => 
      contact.id === contactId 
        ? { ...contact, unread: false } 
        : contact
    ));
  };

  // Guardar patrón personalizado para un contacto
  const handleSaveContactPattern = async (contactId: string, pattern: number[]) => {
    if (!user || !contactId) return false;
    
    try {
      // Verificar si ya existe un patrón para este contacto
      const { data, error: checkError } = await supabase
        .from('contact_patterns')
        .select('*')
        .eq('user_id', user.id)
        .eq('contact_id', contactId);
        
      if (checkError) {
        console.error("Error al verificar patrón existente:", checkError);
        return false;
      }
      
      // Si existe, actualizar; si no, insertar
      if (data && data.length > 0) {
        const { error } = await supabase
          .from('contact_patterns')
          .update({ pattern: JSON.stringify(pattern) })
          .eq('user_id', user.id)
          .eq('contact_id', contactId);
          
        if (error) {
          console.error("Error al actualizar patrón:", error);
          return false;
        }
      } else {
        const { error } = await supabase
          .from('contact_patterns')
          .insert({
            user_id: user.id,
            contact_id: contactId,
            pattern: JSON.stringify(pattern)
          });
          
        if (error) {
          console.error("Error al guardar patrón:", error);
          return false;
        }
        
        // Actualizar lista de contactos con patrón
        setContactsWithActiveLock(prev => [...prev, contactId]);
      }
      
      // Actualizar el contacto para indicar que tiene patrón personalizado
      await supabase
        .from('contacts')
        .update({ has_custom_lock: true })
        .eq('id', contactId)
        .eq('user_id', user.id);
        
      // Actualizar estado local
      setContacts(prev => prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, hasCustomLock: true } 
          : contact
      ));
      
      return true;
    } catch (err) {
      console.error("Error al guardar patrón de contacto:", err);
      return false;
    }
  };

  return {
    contacts,
    contactsWithActiveLock,
    handleCreateChat,
    handleEditContact,
    handleDeleteContact,
    updateContactMessage,
    markContactAsRead,
    handleSaveContactPattern
  };
};
