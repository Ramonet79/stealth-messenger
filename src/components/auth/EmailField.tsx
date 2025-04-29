
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Control } from 'react-hook-form';

interface EmailFieldProps {
  control: Control<any>;
  name: string;
}

export const EmailField = ({ control, name }: EmailFieldProps) => {
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Function to check email availability
  const checkEmailAvailability = async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailAvailable(null);
      return;
    }

    setCheckingEmail(true);
    
    try {
      // Primero verificamos en la tabla profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .ilike('email', email.toLowerCase())
        .limit(1);
      
      if (profileError) {
        console.error('Error al verificar email en profiles:', profileError);
        setEmailAvailable(false);
        setCheckingEmail(false);
        return;
      }
      
      // Si encontramos coincidencia en profiles, ya sabemos que no está disponible
      if (profileData && profileData.length > 0) {
        console.log('Email encontrado en profiles:', profileData);
        setEmailAvailable(false);
        setCheckingEmail(false);
        return;
      }
      
      // Verificamos si el correo existe mediante el método de inicio de sesión
      // Esta es una manera indirecta pero efectiva de verificar si un correo ya está registrado
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase(),
        options: {
          shouldCreateUser: false // Esto previene la creación de un nuevo usuario
        }
      });
      
      // Si no hay error o el error indica que el usuario no existe, entonces el email está disponible
      if (signInError && signInError.message.includes('No user found')) {
        console.log('Email no encontrado en auth:', email);
        setEmailAvailable(true);
      } else {
        console.log('Email posiblemente encontrado en auth');
        setEmailAvailable(false);
      }
    } catch (error) {
      console.error('Error al verificar email:', error);
      setEmailAvailable(false);
    } finally {
      setCheckingEmail(false);
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Correo electrónico</FormLabel>
          <FormControl>
            <div className="relative">
              <Input 
                {...field} 
                type="email"
                placeholder="tu@correo.com" 
                className={`pr-10 ${
                  emailAvailable === true ? 'border-green-500' : 
                  emailAvailable === false ? 'border-red-500' : ''
                }`}
                onChange={(e) => {
                  field.onChange(e);
                  
                  // Implementar debounce
                  if (typingTimeout) {
                    clearTimeout(typingTimeout);
                  }
                  
                  const timeout = setTimeout(() => {
                    checkEmailAvailability(e.target.value);
                  }, 500);
                  
                  setTypingTimeout(timeout);
                }}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {checkingEmail && (
                  <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                )}
                {!checkingEmail && emailAvailable === true && (
                  <span className="text-green-500">✓</span>
                )}
                {!checkingEmail && emailAvailable === false && (
                  <span className="text-red-500">✗</span>
                )}
              </div>
            </div>
          </FormControl>
          {!checkingEmail && emailAvailable === false && (
            <p className="text-xs text-red-500 mt-1">Este correo electrónico ya está en uso</p>
          )}
          {!checkingEmail && emailAvailable === true && (
            <p className="text-xs text-green-500 mt-1">Correo electrónico disponible</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
