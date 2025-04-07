import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { toast } from '@/components/ui/use-toast';

// Define los tipos de props
interface CalculatorProps {
  onSettingsClick: () => void;
  hasUnreadMessages: boolean;
  logoAura?: 'none' | 'green' | 'red';
}

const Calculator: React.FC<CalculatorProps> = ({ 
  onSettingsClick, 
  hasUnreadMessages,
  logoAura = 'none'
}) => {
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState<boolean>(false);
  // Contador para detectar un patrón específico de taps para cerrar sesión
  const [logoutTapCount, setLogoutTapCount] = useState<number>(0);
  const [lastTapTime, setLastTapTime] = useState<number>(0);

  // Efecto para resetear el contador de taps después de un tiempo
  useEffect(() => {
    if (logoutTapCount > 0) {
      const timeout = setTimeout(() => {
        setLogoutTapCount(0);
      }, 3000); // Resetea después de 3 segundos sin taps
      
      return () => clearTimeout(timeout);
    }
  }, [logoutTapCount]);

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error al cerrar sesión:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cerrar la sesión",
        });
      } else {
        toast({
          title: "Sesión cerrada",
          description: "Has cerrado sesión correctamente",
        });
        
        // Recargamos la página para volver a la pantalla de inicio
        window.location.reload();
      }
    } catch (err) {
      console.error('Error inesperado al cerrar sesión:', err);
    }
  };

  // Manejo del tap en el logo para cerrar sesión
  const handleLogoTap = () => {
    const now = Date.now();
    
    // Si pasaron más de 1.5 segundos desde el último tap, reinicia el contador
    if (now - lastTapTime > 1500) {
      setLogoutTapCount(1);
    } else {
      setLogoutTapCount(prevCount => prevCount + 1);
    }
    
    setLastTapTime(now);
    
    // Si alcanzamos 5 taps rápidos, cerramos sesión
    if (logoutTapCount === 4) {
      handleLogout();
      setLogoutTapCount(0);
    }
  };

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand === true) {
      setDisplayValue(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
    }
  };

  const inputDecimal = (dot: string) => {
    if (!displayValue.includes(dot)) {
      setDisplayValue(displayValue + dot);
    }
  };

  const handleOperator = (nextOperator: string) => {
    const inputValue = parseFloat(displayValue);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = performCalculation[operator](firstOperand, inputValue);

      setDisplayValue(String(result));
      setFirstOperand(result);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const performCalculation = {
    '/': (firstOperand: number, secondOperand: number) => firstOperand / secondOperand,
    '*': (firstOperand: number, secondOperand: number) => firstOperand * secondOperand,
    '+': (firstOperand: number, secondOperand: number) => firstOperand + secondOperand,
    '-': (firstOperand: number, secondOperand: number) => firstOperand - secondOperand,
    '=': (firstOperand: number, secondOperand: number) => secondOperand
  };

  const clearDisplay = () => {
    setDisplayValue('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const calculate = () => {
    const inputValue = parseFloat(displayValue);

    if (operator) {
      const result = performCalculation[operator](firstOperand || 0, inputValue);

      setDisplayValue(String(result));
      setFirstOperand(result);
      setWaitingForSecondOperand(false);
      setOperator(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4 pt-12">
      <div className="flex justify-center mb-4">
        <div 
          className={`relative cursor-pointer ${hasUnreadMessages ? 'animate-pulse' : ''}`}
          onClick={handleLogoTap}
        >
          <img 
            src="/lovable-uploads/3f963389-b035-45c6-890b-824df3549300.png" 
            alt="App Logo" 
            className="h-12 w-12 rounded-lg"
          />
          {logoAura !== 'none' && (
            <div 
              className={`absolute -inset-1 rounded-xl opacity-70 ${
                logoAura === 'green' ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ zIndex: -1 }}
            ></div>
          )}
          {logoutTapCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
              {logoutTapCount}
            </div>
          )}
        </div>
      </div>
      
      <div className="text-right text-3xl text-gray-800 mb-4">{displayValue}</div>
      <div className="grid grid-cols-4 gap-2">
        <Button onClick={clearDisplay} className="col-span-3 bg-gray-300 text-gray-700 h-12">AC</Button>
        <Button onClick={onSettingsClick} className="bg-gray-300 text-gray-700 h-12">⚙️</Button>
        <Button onClick={() => inputDigit('7')} className="bg-white text-gray-700 h-12">7</Button>
        <Button onClick={() => inputDigit('8')} className="bg-white text-gray-700 h-12">8</Button>
        <Button onClick={() => inputDigit('9')} className="bg-white text-gray-700 h-12">9</Button>
        <Button onClick={() => handleOperator('/')} className="bg-orange-400 text-white h-12">÷</Button>
        <Button onClick={() => inputDigit('4')} className="bg-white text-gray-700 h-12">4</Button>
        <Button onClick={() => inputDigit('5')} className="bg-white text-gray-700 h-12">5</Button>
        <Button onClick={() => inputDigit('6')} className="bg-white text-gray-700 h-12">6</Button>
        <Button onClick={() => handleOperator('*')} className="bg-orange-400 text-white h-12">x</Button>
        <Button onClick={() => inputDigit('1')} className="bg-white text-gray-700 h-12">1</Button>
        <Button onClick={() => inputDigit('2')} className="bg-white text-gray-700 h-12">2</Button>
        <Button onClick={() => inputDigit('3')} className="bg-white text-gray-700 h-12">3</Button>
        <Button onClick={() => handleOperator('-')} className="bg-orange-400 text-white h-12">-</Button>
        <Button onClick={() => inputDigit('0')} className="col-span-2 bg-white text-gray-700 h-12">0</Button>
        <Button onClick={() => inputDecimal('.')} className="bg-white text-gray-700 h-12">.</Button>
        <Button onClick={() => handleOperator('+')} className="bg-orange-400 text-white h-12">+</Button>
        <Button onClick={calculate} className="col-span-4 bg-orange-500 text-white h-12">=</Button>
      </div>
    </div>
  );
};

export default Calculator;
