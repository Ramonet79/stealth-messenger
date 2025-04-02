
import React, { useState, useRef, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { patternService } from '@/services/patternService';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface Point {
  id: number;
  x: number;
  y: number;
  selected: boolean;
}

interface PatternLockProps {
  onPatternComplete: (pattern: number[]) => boolean; // Changed to return boolean
}

const PatternLock: React.FC<PatternLockProps> = ({ onPatternComplete }) => {
  const [points, setPoints] = useState<Point[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<number[]>([]);
  const [currentPoint, setCurrentPoint] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockEndTime, setLockEndTime] = useState<Date | null>(null);
  const [showLockoutDialog, setShowLockoutDialog] = useState(false);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [remainingTime, setRemainingTime] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useSupabaseAuth();

  // Email del usuario autenticado o email de ejemplo
  const userEmail = user?.email || "usuario@ejemplo.com";
  
  // Initialize points
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const padding = containerWidth * 0.15;
      const cellSize = (containerWidth - padding * 2) / 2;
      
      const initialPoints: Point[] = [
        { id: 1, x: padding, y: padding, selected: false },
        { id: 2, x: padding + cellSize, y: padding, selected: false },
        { id: 3, x: padding + cellSize * 2, y: padding, selected: false },
        { id: 4, x: padding, y: padding + cellSize, selected: false },
        { id: 5, x: padding + cellSize, y: padding + cellSize, selected: false },
        { id: 6, x: padding + cellSize * 2, y: padding + cellSize, selected: false },
        { id: 7, x: padding, y: padding + cellSize * 2, selected: false },
        { id: 8, x: padding + cellSize, y: padding + cellSize * 2, selected: false },
        { id: 9, x: padding + cellSize * 2, y: padding + cellSize * 2, selected: false },
      ];
      
      setPoints(initialPoints);
    }
  }, []);

  // Check if we should unlock based on time
  useEffect(() => {
    if (isLocked && lockEndTime) {
      const timer = setInterval(() => {
        const now = new Date();
        if (now >= lockEndTime) {
          setIsLocked(false);
          setLockEndTime(null);
          clearInterval(timer);
        } else {
          // Calculate remaining time
          const diff = Math.floor((lockEndTime.getTime() - now.getTime()) / 1000);
          const minutes = Math.floor(diff / 60);
          const seconds = diff % 60;
          setRemainingTime(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isLocked, lockEndTime]);
  
  const handlePointStart = (id: number) => {
    if (selectedPattern.includes(id) || isLocked) return;
    
    setIsDrawing(true);
    setCurrentPoint(id);
    setSelectedPattern([...selectedPattern, id]);
    
    setPoints(prevPoints => 
      prevPoints.map(point => 
        point.id === id ? { ...point, selected: true } : point
      )
    );
  };

  const handlePointMouseDown = (id: number) => {
    handlePointStart(id);
  };
  
  const handlePointTouchStart = (id: number) => {
    handlePointStart(id);
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDrawing || !containerRef.current || isLocked) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - containerRect.left;
    const y = touch.clientY - containerRect.top;
    
    checkPointSelection(x, y);
    updateTempLine(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !containerRef.current || isLocked) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;
    
    checkPointSelection(x, y);
    updateTempLine(x, y);
  };

  const checkPointSelection = (x: number, y: number) => {
    // Check if position is over any point
    points.forEach(point => {
      const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
      
      // If over a point and that point is not already selected
      if (distance < 20 && !selectedPattern.includes(point.id)) {
        handlePointStart(point.id);
      }
    });
  };

  const updateTempLine = (x: number, y: number) => {
    // Update line positions
    if (linesRef.current && currentPoint !== null) {
      const currentPointObj = points.find(p => p.id === currentPoint);
      if (currentPointObj) {
        updateLineToPosition(currentPointObj.x, currentPointObj.y, x, y);
      }
    }
  };

  const sendRecoveryEmail = async () => {
    if (user) {
      // En una implementación real, usaríamos Supabase para enviar un email de recuperación
      try {
        await patternService.savePattern(user.id, [1, 2, 3, 4]); // Reset to simple pattern
        
        toast({
          title: "Patrón restablecido",
          description: "Se ha enviado un correo con instrucciones para restablecer tu patrón",
          variant: "default",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo restablecer el patrón",
        });
      }
    } else {
      // Para modo demostración sin autenticación
      toast({
        title: "Código de recuperación enviado",
        description: `Se ha enviado un código a ${userEmail}`,
        variant: "default",
      });
    }
    
    setShowRecoveryDialog(false);
  };
  
  const handleEnd = async () => {
    if (isLocked) return;

    if (selectedPattern.length >= 4) {
      let isCorrect = false;

      if (user) {
        // Verificar con el patrón guardado en Supabase si el usuario está autenticado
        try {
          isCorrect = await patternService.verifyPattern(user.id, selectedPattern);
        } catch (error) {
          console.error("Error verificando patrón:", error);
          isCorrect = false;
        }
      } else {
        // Verificar con onPatternComplete (que puede estar usando el patrón por defecto)
        isCorrect = onPatternComplete(selectedPattern);
      }

      // Si el patrón es incorrecto
      if (!isCorrect) {
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);
        
        if (newFailedAttempts >= 3) {
          // Si es el segundo bloque de 3 intentos fallidos
          if (newFailedAttempts >= 6) {
            setShowRecoveryDialog(true);
          } else {
            // Primer bloque de 3 intentos fallidos, bloquear por 5 minutos
            const lockEndTime = new Date();
            lockEndTime.setMinutes(lockEndTime.getMinutes() + 5);
            setLockEndTime(lockEndTime);
            setIsLocked(true);
            setShowLockoutDialog(true);
          }
        }
        
        toast({
          variant: "destructive",
          title: "Patrón incorrecto",
          description: "Por favor, inténtalo de nuevo",
        });
      } else {
        // Si el patrón es correcto, resetear los intentos fallidos
        setFailedAttempts(0);
      }
    }
    
    // Reset after a short delay
    setTimeout(() => {
      setIsDrawing(false);
      setCurrentPoint(null);
      setSelectedPattern([]);
      setPoints(prevPoints => prevPoints.map(point => ({ ...point, selected: false })));
      
      // Clear lines
      if (linesRef.current) {
        linesRef.current.innerHTML = '';
      }
    }, 500);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  const handleMouseUp = () => {
    handleEnd();
  };
  
  const updateLineToPosition = (fromX: number, fromY: number, toX: number, toY: number) => {
    if (!linesRef.current) return;
    
    // Remove any temporary lines
    const tempLine = linesRef.current.querySelector('.temp-line');
    if (tempLine) {
      tempLine.remove();
    }
    
    // Calculate line parameters
    const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    const angle = Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI);
    
    // Create new line element
    const line = document.createElement('div');
    line.className = 'pattern-line temp-line';
    line.style.width = `${length}px`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.left = `${fromX}px`;
    line.style.top = `${fromY}px`;
    
    linesRef.current.appendChild(line);
  };
  
  const drawLineBetweenPoints = (fromId: number, toId: number) => {
    if (!linesRef.current) return;
    
    const fromPoint = points.find(p => p.id === fromId);
    const toPoint = points.find(p => p.id === toId);
    
    if (!fromPoint || !toPoint) return;
    
    const length = Math.sqrt(
      Math.pow(toPoint.x - fromPoint.x, 2) + Math.pow(toPoint.y - fromPoint.y, 2)
    );
    
    const angle = Math.atan2(toPoint.y - fromPoint.y, toPoint.x - fromPoint.x) * (180 / Math.PI);
    
    const line = document.createElement('div');
    line.className = 'pattern-line';
    line.style.width = `${length}px`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.left = `${fromPoint.x}px`;
    line.style.top = `${fromPoint.y}px`;
    
    linesRef.current.appendChild(line);
  };
  
  // Draw lines between selected points
  useEffect(() => {
    if (!linesRef.current) return;
    
    // Clear existing lines
    linesRef.current.innerHTML = '';
    
    // Draw lines between points
    for (let i = 0; i < selectedPattern.length - 1; i++) {
      drawLineBetweenPoints(selectedPattern[i], selectedPattern[i + 1]);
    }
  }, [selectedPattern]);
  
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-100">
      <h2 className="text-2xl font-bold mb-8">Desbloquear App</h2>
      
      {isLocked && (
        <Alert className="mb-4 max-w-md">
          <AlertDescription>
            La entrada está bloqueada por demasiados intentos fallidos. 
            Tiempo restante: {remainingTime}
          </AlertDescription>
        </Alert>
      )}
      
      <div 
        ref={containerRef} 
        className={`relative w-[320px] h-[320px] touch-none cursor-pointer ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Lines container */}
        <div ref={linesRef} className="absolute inset-0"></div>
        
        {/* Points */}
        {points.map((point) => (
          <div
            key={point.id}
            className={`pattern-point absolute transition-all ${
              point.selected ? 'selected' : ''
            }`}
            style={{
              left: point.x - 8,
              top: point.y - 8,
            }}
            onTouchStart={() => handlePointTouchStart(point.id)}
            onMouseDown={() => handlePointMouseDown(point.id)}
          />
        ))}
      </div>
      <p className="mt-8 text-gray-500">Dibuja tu patrón para acceder</p>

      {/* Diálogo de bloqueo temporal */}
      <Dialog open={showLockoutDialog} onOpenChange={setShowLockoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cuenta temporalmente bloqueada</DialogTitle>
            <DialogDescription>
              Has excedido el número máximo de intentos fallidos. Por seguridad, 
              la autenticación se ha bloqueado durante 5 minutos.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowLockoutDialog(false)}>Entendido</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de recuperación por email */}
      <Dialog open={showRecoveryDialog} onOpenChange={setShowRecoveryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envío de patrón de recuperación</DialogTitle>
            <DialogDescription>
              Has excedido el número máximo de intentos permitidos. 
              Enviaremos un código de recuperación a tu correo electrónico registrado:
              <p className="font-medium mt-2">{userEmail}</p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowRecoveryDialog(false)}>Cancelar</Button>
            <Button onClick={sendRecoveryEmail}>Enviar código</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatternLock;
