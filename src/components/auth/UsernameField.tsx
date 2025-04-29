
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Control } from 'react-hook-form';

interface UsernameFieldProps {
  control: Control<any>;
  name: string;
}

export const UsernameField = ({ control, name }: UsernameFieldProps) => {
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const checkUsernameAvailability = async (value: string) => {
    if (!value || value.length < 4) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    
    try {
      // Consulta case-insensitive para verificar si el username ya existe
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', value)
        .limit(1);
      
      if (error) {
        console.error('Error al verificar nombre de usuario:', error);
        setUsernameAvailable(false);
        return;
      }
      
      // Si hay resultados, el username no está disponible
      setUsernameAvailable(!(data && data.length > 0));
      
    } catch (error) {
      console.error('Error general:', error);
      setUsernameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  };

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
                onChange={(e) => {
                  field.onChange(e);
                  
                  // Implementar debounce
                  if (typingTimeout) {
                    clearTimeout(typingTimeout);
                  }
                  
                  const timeout = setTimeout(() => {
                    checkUsernameAvailability(e.target.value);
                  }, 500);
                  
                  setTypingTimeout(timeout);
                }}
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
