
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';

interface EmailFieldProps {
  control: Control<any>;
}

export const EmailField = ({ control }: EmailFieldProps) => {
  return (
    <FormField
      control={control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Correo electrónico</FormLabel>
          <FormControl>
            <Input 
              {...field} 
              type="email" 
              placeholder="tu@email.com" 
            />
          </FormControl>
          <p className="text-xs text-gray-500 mt-1">
            Este correo se utilizará para acceder a tu cuenta y para recuperarla si la olvidas
          </p>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
