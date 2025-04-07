
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VerificationSuccessProps {
  onLogin: () => void;
}

export const VerificationSuccess = ({ onLogin }: VerificationSuccessProps) => {
  return (
    <>
      <div className="flex justify-center mb-6">
        <img 
          src="/lovable-uploads/3f963389-b035-45c6-890b-824df3549300.png" 
          alt="dScrt Logo" 
          className="h-20 w-20 rounded-lg" 
        />
      </div>
      
      <div className="flex justify-center mb-6">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      
      <h1 className="text-2xl font-bold mb-4 text-center">
        ¡Cuenta verificada!
      </h1>
      
      <p className="text-center mb-6">
        Tu cuenta ha sido verificada correctamente. Por favor, inicia sesión para continuar y crear tu patrón de desbloqueo.
      </p>
      
      <Button 
        type="button" 
        className="w-full"
        onClick={onLogin}
      >
        Iniciar sesión
      </Button>
    </>
  );
};
