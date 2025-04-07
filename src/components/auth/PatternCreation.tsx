
import React from 'react';
import PatternLock from '@/components/PatternLock';
import { patternService } from '@/services/patternService';
import { useToast } from '@/hooks/use-toast';

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
      <h1 className="text-2xl font-bold mb-6">
        {step === 1 ? "Crear patrón de desbloqueo" : "Confirmar patrón"}
      </h1>
      <p className="text-sm text-gray-600 mb-8 text-center">
        {step === 1 
          ? "Dibuja un patrón que usarás para desbloquear la aplicación. Recuérdalo bien." 
          : "Dibuja nuevamente el mismo patrón para confirmarlo."}
      </p>
      <PatternLock onPatternComplete={handlePatternComplete} />
    </div>
  );
};
