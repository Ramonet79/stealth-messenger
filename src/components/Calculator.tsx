
import React, { useState } from 'react';
import { Settings } from 'lucide-react';

interface CalculatorProps {
  onSettingsClick: () => void;
  hasUnreadMessages?: boolean;
}

const Calculator: React.FC<CalculatorProps> = ({ onSettingsClick, hasUnreadMessages = false }) => {
  const [display, setDisplay] = useState('0');
  const [waitingForOperand, setWaitingForOperand] = useState(true);
  const [pendingOperator, setPendingOperator] = useState<string | null>(null);
  const [storedValue, setStoredValue] = useState<number | null>(null);

  const calculateResult = () => {
    if (pendingOperator === null || storedValue === null) return;
    
    const currentValue = parseFloat(display);
    let newResult = 0;
    
    switch (pendingOperator) {
      case '+':
        newResult = storedValue + currentValue;
        break;
      case '-':
        newResult = storedValue - currentValue;
        break;
      case '×':
        newResult = storedValue * currentValue;
        break;
      case '÷':
        newResult = storedValue / currentValue;
        break;
      default:
        return;
    }
    
    setDisplay(newResult.toString());
    setStoredValue(null);
    setPendingOperator(null);
    setWaitingForOperand(true);
  };

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const performOperation = (operator: string) => {
    const inputValue = parseFloat(display);
    
    if (storedValue === null) {
      setStoredValue(inputValue);
    } else if (pendingOperator) {
      const currentValue = storedValue;
      let newResult = 0;
      
      switch (pendingOperator) {
        case '+':
          newResult = currentValue + inputValue;
          break;
        case '-':
          newResult = currentValue - inputValue;
          break;
        case '×':
          newResult = currentValue * inputValue;
          break;
        case '÷':
          newResult = currentValue / inputValue;
          break;
        default:
          return;
      }
      
      setStoredValue(newResult);
      setDisplay(newResult.toString());
    }
    
    setPendingOperator(operator);
    setWaitingForOperand(true);
  };

  const clear = () => {
    setDisplay('0');
    setWaitingForOperand(true);
    setPendingOperator(null);
    setStoredValue(null);
  };

  const clearEntry = () => {
    setDisplay('0');
    setWaitingForOperand(true);
  };

  const changeSign = () => {
    setDisplay(display.charAt(0) === '-' ? display.substring(1) : '-' + display);
  };

  const percentage = () => {
    const currentValue = parseFloat(display);
    setDisplay((currentValue / 100).toString());
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Display */}
      <div className="flex justify-between items-center bg-calculator-display p-4 text-white">
        <div className="text-right flex-1 overflow-hidden">
          <div className="text-3xl font-medium truncate">{display}</div>
        </div>
        <button 
          onClick={onSettingsClick} 
          className="ml-4 p-2 rounded-full hover:bg-white/10 transition-colors relative"
        >
          <Settings size={24} />
          {hasUnreadMessages && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
          )}
        </button>
      </div>
      
      {/* Keyboard */}
      <div className="grid grid-cols-4 gap-1 p-2 bg-gray-200 flex-1">
        {/* Row 1 */}
        <button onClick={() => clear()} className="calculator-button bg-calculator-special text-white">AC</button>
        <button onClick={() => changeSign()} className="calculator-button bg-calculator-special text-white">+/-</button>
        <button onClick={() => percentage()} className="calculator-button bg-calculator-special text-white">%</button>
        <button onClick={() => performOperation('÷')} className="calculator-button bg-calculator-operator text-white">÷</button>
        
        {/* Row 2 */}
        <button onClick={() => inputDigit('7')} className="calculator-button bg-calculator-button">7</button>
        <button onClick={() => inputDigit('8')} className="calculator-button bg-calculator-button">8</button>
        <button onClick={() => inputDigit('9')} className="calculator-button bg-calculator-button">9</button>
        <button onClick={() => performOperation('×')} className="calculator-button bg-calculator-operator text-white">×</button>
        
        {/* Row 3 */}
        <button onClick={() => inputDigit('4')} className="calculator-button bg-calculator-button">4</button>
        <button onClick={() => inputDigit('5')} className="calculator-button bg-calculator-button">5</button>
        <button onClick={() => inputDigit('6')} className="calculator-button bg-calculator-button">6</button>
        <button onClick={() => performOperation('-')} className="calculator-button bg-calculator-operator text-white">-</button>
        
        {/* Row 4 */}
        <button onClick={() => inputDigit('1')} className="calculator-button bg-calculator-button">1</button>
        <button onClick={() => inputDigit('2')} className="calculator-button bg-calculator-button">2</button>
        <button onClick={() => inputDigit('3')} className="calculator-button bg-calculator-button">3</button>
        <button onClick={() => performOperation('+')} className="calculator-button bg-calculator-operator text-white">+</button>
        
        {/* Row 5 */}
        <button onClick={() => inputDigit('0')} className="calculator-button bg-calculator-button col-span-2">0</button>
        <button onClick={() => inputDot()} className="calculator-button bg-calculator-button">.</button>
        <button onClick={() => calculateResult()} className="calculator-button bg-calculator-equals text-white">=</button>
      </div>
    </div>
  );
};

export default Calculator;
