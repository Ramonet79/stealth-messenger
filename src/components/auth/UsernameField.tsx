
// src/components/auth/UsernameField.tsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { FormControl, FormItem, FormLabel, FormMessage } from '../ui/form';
import { ControllerRenderProps, UseFormReturn } from 'react-hook-form';
import { SignupFormValues } from './validation-schemas';

interface UsernameFieldProps {
  field: ControllerRenderProps<SignupFormValues, "username">;
  form: UseFormReturn<SignupFormValues>;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const UsernameField = ({ field, form, onBlur }: UsernameFieldProps) => {
  return (
    <FormItem>
      <FormLabel htmlFor="username">Nombre de usuario</FormLabel>
      <FormControl>
        <Input
          id="username"
          type="text"
          placeholder="Elige un nombre de usuario único"
          autoComplete="username"
          value={field.value as string}
          onChange={field.onChange}
          name={field.name}
          ref={field.ref}
          onBlur={onBlur}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
