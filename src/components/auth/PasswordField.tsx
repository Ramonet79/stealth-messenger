
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';

interface PasswordFieldProps {
  control: Control<any>;
  name?: string;
}

export const PasswordField = ({ control, name = "password" }: PasswordFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Contraseña</FormLabel>
          <FormControl>
            <Input 
              {...field} 
              type="password" 
              placeholder="********" 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
