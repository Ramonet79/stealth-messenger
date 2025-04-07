
// This component is kept in the codebase but no longer used after removing email verification
import React from 'react';
import { Button } from '@/components/ui/button';

interface VerificationEmailSentProps {
  onBack: () => void;
}

export const VerificationEmailSent = ({ onBack }: VerificationEmailSentProps) => {
  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-4">Email de verificación enviado</h2>
      <p className="mb-6 text-gray-600">
        Hemos enviado un correo de verificación a tu dirección de email. 
        Por favor, revisa tu bandeja de entrada y sigue las instrucciones para activar tu cuenta.
      </p>
      <Button onClick={onBack} variant="outline" className="w-full">
        Volver al inicio
      </Button>
    </div>
  );
};
