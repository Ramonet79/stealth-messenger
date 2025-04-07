
import React from 'react';
import PatternLock from '@/components/PatternLock';
import { patternService } from '@/services/patternService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from "@/components/ui/alert";

type PatternCreationProps = {
  userId: string;
  step: number;
  setStep: (step: number) => void;
  newPattern: number[];
  setNewPattern: (pattern: number[]) => void;
  onComplete: () => void;
};

export const PatternCreation = ({ 
  userId, 
  step, 
  setStep, 
  newPattern,
  setNewPattern,
  onComplete 
}: PatternCreationProps) => {
  const { toast } = useToast();

  // Manejar creación de patrón
  const handlePatternComplete = async (pattern: number[]): Promise<boolean> => {
    if (step === 1) {
      setNewPattern(pattern);
      setStep(2);
      toast({
        title: "Patrón registrado",
        description: "Por favor, confirma tu patrón",
      });
      return true;
    } else {
      const patternsMatch = pattern.length === newPattern.length && 
        pattern.every((val, idx) => val === newPattern[idx]);
      
      if (patternsMatch) {
        await patternService.savePattern(userId, pattern);
        toast({
          title: "Patrón establecido",
          description: "Tu patrón de desbloqueo ha sido guardado",
        });
        onComplete();
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Los patrones no coinciden",
          description: "Por favor, intenta nuevamente",
        });
        setStep(1);
        return false;
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="flex justify-center mb-6">
        <img src="/lovable-uploads/3f963389-b035-45c6-890b-824df3549300.png" 
          alt="dScrt Logo" 
          className="h-20 w-20 rounded-lg" />
      </div>
      
      <h1 className="text-2xl font-bold mb-4 text-center">
        {step === 1 ? "Crear patrón de desbloqueo" : "Confirmar patrón"}
      </h1>
      
      <Alert className="mb-6 max-w-md">
        <AlertDescription>
          El logo de la aplicación ha cambiado a dScrt. Necesitas crear un patrón de desbloqueo 
          para acceder a tu chat seguro.
        </AlertDescription>
      </Alert>
      
      <p className="text-sm text-gray-600 mb-8 text-center max-w-md">
        {step === 1 
          ? "Dibuja un patrón que usarás para desbloquear la aplicación. Recuérdalo bien." 
          : "Dibuja nuevamente el mismo patrón para confirmarlo."}
      </p>
      
      <PatternLock onPatternComplete={handlePatternComplete} />
      
      {step === 2 && (
        <div className="mt-8 text-center max-w-md">
          <p className="text-sm text-gray-600 mb-4">
            Después de crear tu patrón, podrás acceder al chat dScrt 
            pulsando el icono de configuración en la app camuflada.
          </p>
        </div>
      )}
    </div>
  );
};
