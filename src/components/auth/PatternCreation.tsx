
import React, { useState } from 'react';
import PatternLock from '@/components/PatternLock';
import { patternService } from '@/services/patternService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
  const [showPatternModal, setShowPatternModal] = useState(false);
  
  // Manejar creación de patrón
  const handlePatternComplete = async (pattern: number[]): Promise<boolean> => {
    // Verificamos que el patrón tenga al menos 4 puntos
    if (pattern.length < 4) {
      toast({
        variant: "destructive",
        title: "Patrón demasiado corto",
        description: "El patrón debe conectar al menos 4 puntos",
      });
      return false;
    }
    
    if (step === 1) {
      console.log("Patrón registrado en paso 1:", pattern);
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
      
      console.log("Confirmando patrón:", pattern);
      console.log("Comparando con patrón guardado:", newPattern);
      console.log("¿Coinciden?", patternsMatch);
      
      if (patternsMatch) {
        try {
          console.log("Guardando patrón para el usuario:", userId);
          await patternService.savePattern(userId, pattern);
          toast({
            title: "Patrón establecido",
            description: "Tu patrón de desbloqueo ha sido guardado",
          });
          setShowPatternModal(false);
          onComplete();
          return true;
        } catch (error) {
          console.error("Error al guardar el patrón:", error);
          toast({
            variant: "destructive",
            title: "Error al guardar",
            description: "No se pudo guardar el patrón. Por favor, inténtalo de nuevo.",
          });
          return false;
        }
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
        Configuración de dScrt
      </h1>
      
      <Alert className="mb-6 max-w-md">
        <AlertDescription>
          El logo de la aplicación ha cambiado a dScrt. Necesitas crear un patrón de desbloqueo 
          para acceder a tu chat seguro.
        </AlertDescription>
      </Alert>
      
      <Alert className="mb-6 max-w-md">
        <AlertDescription>
          <strong>Importante:</strong> Tu patrón debe conectar al menos 4 puntos.
          Dibuja un patrón sencillo que puedas recordar fácilmente.
        </AlertDescription>
      </Alert>
      
      <div className="flex flex-col items-center">
        <Button 
          onClick={() => {
            setStep(1);
            setShowPatternModal(true);
          }}
          size="lg"
          className="mb-4"
        >
          Crear Patrón de Acceso al Chat dScrt
        </Button>
        
        <p className="text-sm text-gray-600 mt-4 text-center max-w-md">
          Después de crear tu patrón, podrás acceder al chat dScrt 
          pulsando el icono de configuración en la app camuflada.
        </p>
      </div>
      
      <Dialog 
        open={showPatternModal} 
        onOpenChange={(open) => {
          if (!open) {
            // Solo permitir cerrar el modal si no estamos en medio de la confirmación
            if (step !== 2) {
              setShowPatternModal(false);
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-md h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {step === 1 ? "Crear patrón de desbloqueo" : "Confirmar patrón"}
            </DialogTitle>
            <DialogDescription>
              {step === 1 
                ? "Dibuja un patrón que usarás para desbloquear la aplicación. Recuérdalo bien."
                : "Dibuja nuevamente el mismo patrón para confirmarlo."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            <PatternLock 
              onPatternComplete={handlePatternComplete} 
              isCreationMode={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
