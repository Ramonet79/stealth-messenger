
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Control, useWatch } from 'react-hook-form';
import * as z from "zod";

interface UsernameFieldProps {
  control: Control<any>;
  name: string;
}

export const UsernameField = ({ control, name }: UsernameFieldProps) => {
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Use the useWatch hook to observe changes to the username field
  const username = useWatch({
    control,
    name,
  });

  // Function to check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 8) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    console.log('Verificando disponibilidad del username:', username);
    
    try {
      // Consulta case-insensitive para verificar si el username ya existe en profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', username)
        .limit(1);
      
      if (profilesError) {
        console.error('Error al verificar nombre de usuario en profiles:', profilesError);
        setUsernameAvailable(false);
        setCheckingUsername(false);
        return;
      }
      
      // Si encontramos coincidencia en profiles, ya sabemos que no está disponible
      if (profilesData && profilesData.length > 0) {
        console.log('Username encontrado en profiles:', profilesData);
        setUsernameAvailable(false);
        setCheckingUsername(false);
        return;
      }
      
      // También podemos verificar en auth.users (aunque no es necesario para este caso)
      // ya que usamos la tabla profiles como fuente de verdad para los usernames
      console.log('Username no encontrado en profiles, está disponible');
      setUsernameAvailable(true);
    } catch (error) {
      console.error('Error al verificar nombre de usuario:', error);
      setUsernameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Watch for changes in the username field
  useEffect(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    if (username && username.length >= 8) {
      const timeout = setTimeout(() => {
        checkUsernameAvailability(username);
      }, 500);
      
      setTypingTimeout(timeout);
    } else {
      setUsernameAvailable(null);
    }
    
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [username]);

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
