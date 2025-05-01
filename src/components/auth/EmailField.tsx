
// src/components/auth/EmailField.tsx
import React from 'react';
import { useController, Control, Path, FieldValues } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { useCheckEmail } from '@/hooks/useCheckEmail';
import { FormControl, FormItem, FormLabel, FormMessage } from '../ui/form';

export interface EmailFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
}

export function EmailField<T extends FieldValues>({ control, name }: EmailFieldProps<T>) {
  const { field } = useController({ control, name });
  const { isAvailable, loading, checkEmail } = useCheckEmail();

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      checkEmail(value);
    }
    field.onBlur(); // Mantener el comportamiento onBlur original de react-hook-form
  };

  return (
    <FormItem>
      <FormLabel className="block text-sm font-medium mb-1" htmlFor="email">
        Correo electrónico
      </FormLabel>
      <FormControl>
        <Input
          {...field}
          id="email"
          type="email"
          placeholder="tú@ejemplo.com"
          onBlur={handleBlur}
          className="w-full"
        />
      </FormControl>
      {loading && <p className="mt-1 text-sm text-gray-500">Verificando email...</p>}
      {isAvailable === true && (
        <p className="mt-1 text-sm text-green-600">✔ Este email está libre</p>
      )}
      {isAvailable === false && (
        <p className="mt-1 text-sm text-red-600">❌ Este correo ya está en uso</p>
      )}
      <FormMessage />
    </FormItem>
  );
}
