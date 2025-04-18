
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Control, useWatch } from 'react-hook-form';

interface EmailFieldProps {
  control: Control<any>;
}

export const EmailField = ({ control }: EmailFieldProps) => {
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Use the useWatch hook to observe changes to the email field
  const email = useWatch({
    control,
    name: "email",
  });

  // Function to check email availability
  const checkEmailAvailability = async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailAvailable(null);
      return;
    }

    setCheckingEmail(true);
    
    try {
      // Consulta para verificar si el email ya existe
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase())
        .limit(1);
      
      if (error) {
        console.error('Error al verificar email:', error);
        setEmailAvailable(false);
      } else if (data && data.length > 0) {
        // Si hay resultados, el email no está disponible
        setEmailAvailable(false);
      } else {
        // Si no hay resultados, el email está disponible
        setEmailAvailable(true);
      }
    } catch (error) {
      console.error('Error al verificar email:', error);
      setEmailAvailable(false);
    } finally {
      setCheckingEmail(false);
    }
  };

  // Watch for changes in the email field
  useEffect(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    if (email && email.includes('@')) {
      const timeout = setTimeout(() => {
        checkEmailAvailability(email);
      }, 500);
      
      setTypingTimeout(timeout);
    } else {
      setEmailAvailable(null);
    }
    
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [email]);

  return (
    <FormField
      control={control}
      name="email"
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
