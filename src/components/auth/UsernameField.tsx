
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Control } from 'react-hook-form';
import * as z from "zod";

interface UsernameFieldProps {
  control: Control<any>;
  name: string;
}

export const UsernameField = ({ control, name }: UsernameFieldProps) => {
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Function to check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 8) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    
    try {
      // Consulta case-insensitive para verificar si el username ya existe
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', username)
        .limit(1);
      
      if (error) {
        console.error('Error al verificar nombre de usuario:', error);
        setUsernameAvailable(false);
      } else if (data && data.length > 0) {
        // Si hay resultados, el nombre de usuario no está disponible
        setUsernameAvailable(false);
      } else {
        // Si no hay resultados, el nombre de usuario está disponible
        setUsernameAvailable(true);
      }
    } catch (error) {
      console.error('Error al verificar nombre de usuario:', error);
      setUsernameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Detect changes in the username field
  useEffect(() => {
    const subscription = control._subjects.watch.subscribe(({ name: fieldName, value }) => {
      if (fieldName === name && value) {
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }
        
        if (value && value.length >= 8) {
          const timeout = setTimeout(() => {
            checkUsernameAvailability(value);
          }, 500);
          
          setTypingTimeout(timeout);
        } else {
          setUsernameAvailable(null);
        }
      }
    });
    
    return () => {
      subscription.unsubscribe();
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [control, name]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nombre de usuario</FormLabel>
          <FormControl>
            <div className="relative">
              <Input 
                {...field} 
                placeholder="usuario123" 
                className={`pr-10 ${
                  usernameAvailable === true ? 'border-green-500' : 
                  usernameAvailable === false ? 'border-red-500' : ''
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {checkingUsername && (
                  <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                )}
                {!checkingUsername && usernameAvailable === true && (
                  <span className="text-green-500">✓</span>
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <span className="text-red-500">✗</span>
                )}
              </div>
            </div>
          </FormControl>
          {!checkingUsername && usernameAvailable === false && (
            <p className="text-xs text-red-500 mt-1">Este nombre de usuario ya está en uso</p>
          )}
          {!checkingUsername && usernameAvailable === true && (
            <p className="text-xs text-green-500 mt-1">Nombre de usuario disponible</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Este será tu identificador único en dScrt. Otros usuarios podrán utilizarlo para encontrarte y comenzar conversaciones contigo.
          </p>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
