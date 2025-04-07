
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VerificationErrorProps {
  error: string;
  onRetry: () => void;
}

export const VerificationError = ({ error, onRetry }: VerificationErrorProps) => {
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
        <AlertTriangle className="h-16 w-16 text-red-500" />
      </div>
      
      <h1 className="text-2xl font-bold mb-4 text-center">
        Error de confirmación
      </h1>
      
      <Alert variant="destructive" className="mb-6">
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
      
      <p className="text-center mb-6">
        Ha ocurrido un error al confirmar tu cuenta. Por favor, intenta registrarte nuevamente 
        o contacta con soporte si el problema persiste.
      </p>
      
      <Button 
        type="button" 
        className="w-full"
        onClick={onRetry}
      >
        Intentar de nuevo
      </Button>
    </>
  );
};
