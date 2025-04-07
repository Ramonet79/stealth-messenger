
import React from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VerificationEmailSentProps {
  onBack: () => void;
}

export const VerificationEmailSent = ({ onBack }: VerificationEmailSentProps) => {
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
        <Mail className="h-16 w-16 text-blue-500" />
      </div>
      
      <h1 className="text-2xl font-bold mb-4 text-center">
        Verifica tu correo electrónico
      </h1>
      
      <p className="text-center mb-6">
        Hemos enviado un enlace de confirmación a tu correo. 
        Por favor, revisa tu bandeja de entrada y haz clic en el enlace para verificar tu cuenta.
      </p>
      
      <Alert className="mb-4">
        <AlertDescription>
          Después de confirmar, regresarás aquí para crear tu patrón de desbloqueo.
        </AlertDescription>
      </Alert>
      
      <Button 
        type="button" 
        variant="outline" 
        className="w-full mt-2"
        onClick={onBack}
      >
        Volver
      </Button>
    </>
  );
};
