// src/components/auth/EmailField.tsx
import React from 'react';
import { useController, Control, Path } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client'; // por si lo necesitas
import { useCheckEmail } from '@/hooks/useCheckEmail';

export interface EmailFieldProps<T> {
  control: Control<T>;
  name: Path<T>;
}

export function EmailField<T>({ control, name }: EmailFieldProps<T>) {
  const { field } = useController({ control, name });
  const { isAvailable, loading, checkEmail } = useCheckEmail();

  return (
    <div>
      <label className="block text-sm font-medium mb-1" htmlFor="email">
        Correo electrónico
      </label>
      <Input
        {...field}
        id="email"
        type="email"
        placeholder="tú@ejemplo.com"
        onBlur={(e) => checkEmail(e.target.value)}
        className="w-full"
      />
      {loading && <p className="mt-1 text-sm text-gray-500">Verificando email...</p>}
      {isAvailable === true && (
        <p className="mt-1 text-sm text-green-600">✔ Este email está libre</p>
      )}
      {isAvailable === false && (
        <p className="mt-1 text-sm text-red-600">❌ Este correo ya está en uso</p>
      )}
    </div>
  );
}
