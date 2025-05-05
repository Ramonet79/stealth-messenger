
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
        phone: '', // Usamos valor por defecto ya que no existe en la BD
        lastMessage: 'Sin mensajes', // Valor por defecto
        timestamp: '00:00', // Valor por defecto
        unread: false, // Valor por defecto
        fullName: contact.full_name || null,
        notes: contact.notes || null,
        hasCustomLock: false // Inicializamos en false y luego actualizamos
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
        .from('contact_unlock_patterns')
        .select('contact_id')
        .eq('user_id', user.id)
        .eq('is_enabled', true);
        
      if (error) {
        console.error("Error al cargar patrones de contactos:", error);
        return;
      }
      
      // Extraer IDs de contactos con patrón
      const contactsWithLock = data.map(item => item.contact_id);
      console.log("Contactos con patrón personalizado:", contactsWithLock);
      setContactsWithActiveLock(contactsWithLock);
      
      // Actualizar el estado de los contactos con el flag hasCustomLock
      setContacts(prevContacts => prevContacts.map(contact => ({
        ...contact,
        hasCustomLock: contactsWithLock.includes(contact.id)
      })));
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
      
      const newContactId = uuidv4();
      
      // Guardar en Supabase - asegurándonos de usar solo campos que existen en la tabla
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          id: newContactId,
          user_id: user.id,
          name: contactName,
          full_name: username // Guardamos el username en full_name
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
      
      // Crear objeto Contact para la UI
      const newContact: Contact = {
        id: newContactId,
        name: contactName,
        phone: '',
        lastMessage: 'Nuevo chat creado',
        timestamp,
        unread: false,
        fullName: username
      };
      
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
      // Solo enviamos a Supabase los campos que existen en la tabla
      const dbUpdateData: any = {
        name: data.name,
        full_name: data.fullName,
        notes: data.notes
      };
      
      // Actualizar en Supabase
      const { error } = await supabase
        .from('contacts')
        .update(dbUpdateData)
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
        .from('contact_unlock_patterns')
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
    
    // Actualizamos solo en la UI, ya que la tabla en BD no tiene estos campos
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
    // Actualizamos solo en la UI, ya que la tabla en BD no tiene estos campos
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
        .from('contact_unlock_patterns')
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
          .from('contact_unlock_patterns')
          .update({ pattern: JSON.stringify(pattern) })
          .eq('user_id', user.id)
          .eq('contact_id', contactId);
          
        if (error) {
          console.error("Error al actualizar patrón:", error);
          return false;
        }
      } else {
        const { error } = await supabase
          .from('contact_unlock_patterns')
          .insert({
            user_id: user.id,
            contact_id: contactId,
            pattern: JSON.stringify(pattern),
            is_enabled: true
          });
          
        if (error) {
          console.error("Error al guardar patrón:", error);
          return false;
        }
        
        // Actualizar lista de contactos con patrón
        setContactsWithActiveLock(prev => [...prev, contactId]);
      }
      
      // No necesitamos actualizar la tabla contacts ya que no tiene el campo has_custom_lock
      
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
