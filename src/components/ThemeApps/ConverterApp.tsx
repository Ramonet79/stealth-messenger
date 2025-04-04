import React, { useState, useEffect } from 'react';
import { Settings, ArrowDown, RotateCcw } from 'lucide-react';

interface ConverterAppProps {
  onSettingsClick: () => void;
  hasUnreadMessages?: boolean;
  logoAura?: 'none' | 'green' | 'red';
}

type ConversionType = 'currency' | 'length' | 'weight' | 'temperature';

interface ConversionOption {
  id: string;
  name: string;
  symbol: string;
  rate?: number;
}

const ConverterApp: React.FC<ConverterAppProps> = ({ onSettingsClick, hasUnreadMessages = false, logoAura = 'none' }) => {
  const [conversionType, setConversionType] = useState<ConversionType>('currency');
  const [amount, setAmount] = useState<string>('1');
  const [fromOption, setFromOption] = useState<string>('eur');
  const [toOption, setToOption] = useState<string>('usd');
  const [result, setResult] = useState<string>('');
  
  const conversionOptions = {
    currency: [
      { id: 'eur', name: 'Euro', symbol: '€', rate: 1 },
      { id: 'usd', name: 'Dólar US', symbol: '$', rate: 1.09 },
      { id: 'gbp', name: 'Libra', symbol: '£', rate: 0.85 },
      { id: 'jpy', name: 'Yen', symbol: '¥', rate: 157.3 },
    ],
    length: [
      { id: 'm', name: 'Metro', symbol: 'm', rate: 1 },
      { id: 'km', name: 'Kilómetro', symbol: 'km', rate: 0.001 },
      { id: 'cm', name: 'Centímetro', symbol: 'cm', rate: 100 },
      { id: 'mi', name: 'Milla', symbol: 'mi', rate: 0.000621371 },
    ],
    weight: [
      { id: 'kg', name: 'Kilogramo', symbol: 'kg', rate: 1 },
      { id: 'g', name: 'Gramo', symbol: 'g', rate: 1000 },
      { id: 'lb', name: 'Libra', symbol: 'lb', rate: 2.20462 },
      { id: 'oz', name: 'Onza', symbol: 'oz', rate: 35.274 },
    ],
    temperature: [
      { id: 'c', name: 'Celsius', symbol: '°C', rate: 1 },
      { id: 'f', name: 'Fahrenheit', symbol: '°F', rate: 1 },
      { id: 'k', name: 'Kelvin', symbol: 'K', rate: 1 },
    ]
  };

  const calculateConversion = () => {
    const options = conversionOptions[conversionType];
    const fromObj = options.find(o => o.id === fromOption);
    const toObj = options.find(o => o.id === toOption);
    
    if (!fromObj || !toObj) return '0';
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '0';
    
    if (conversionType === 'temperature') {
      // Special case for temperature
      if (fromOption === 'c' && toOption === 'f') {
        return ((numAmount * 9/5) + 32).toFixed(2);
      } else if (fromOption === 'c' && toOption === 'k') {
        return (numAmount + 273.15).toFixed(2);
      } else if (fromOption === 'f' && toOption === 'c') {
        return ((numAmount - 32) * 5/9).toFixed(2);
      } else if (fromOption === 'f' && toOption === 'k') {
        return ((numAmount - 32) * 5/9 + 273.15).toFixed(2);
      } else if (fromOption === 'k' && toOption === 'c') {
        return (numAmount - 273.15).toFixed(2);
      } else if (fromOption === 'k' && toOption === 'f') {
        return ((numAmount - 273.15) * 9/5 + 32).toFixed(2);
      } else {
        return numAmount.toString(); // Same unit
      }
    } else {
      // General case for other conversions
      return ((numAmount / fromObj.rate!) * toObj.rate!).toFixed(6);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleSwapUnits = () => {
    const temp = fromOption;
    setFromOption(toOption);
    setToOption(temp);
  };

  useEffect(() => {
    const calculated = calculateConversion();
    setResult(calculated);
  }, [amount, fromOption, toOption, conversionType]);

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white border-b">
        <h1 className="text-xl font-semibold">Conversor</h1>
        <button 
          onClick={onSettingsClick} 
          className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
        >
          <Settings size={24} />
          {hasUnreadMessages && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
          )}
          {logoAura !== 'none' && (
            <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${logoAura === 'green' ? 'bg-green-400' : 'bg-red-400'} opacity-75 animate-pulse`}></span>
          )}
        </button>
      </div>
      
      {/* Conversion Type Selector */}
      <div className="p-4 bg-white">
        <div className="grid grid-cols-4 gap-2">
          <button 
            className={`p-2 text-center rounded-lg ${conversionType === 'currency' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setConversionType('currency')}
          >
            Divisas
          </button>
          <button 
            className={`p-2 text-center rounded-lg ${conversionType === 'length' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setConversionType('length')}
          >
            Longitud
          </button>
          <button 
            className={`p-2 text-center rounded-lg ${conversionType === 'weight' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setConversionType('weight')}
          >
            Peso
          </button>
          <button 
            className={`p-2 text-center rounded-lg ${conversionType === 'temperature' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setConversionType('temperature')}
          >
            Temp.
          </button>
        </div>
      </div>
      
      {/* Converter */}
      <div className="flex-1 p-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          {/* From Unit */}
          <div className="mb-4">
            <label className="block text-sm text-gray-500 mb-1">De</label>
            <div className="flex">
              <select 
                className="flex-1 p-3 border rounded-l-lg outline-none"
                value={fromOption}
                onChange={(e) => setFromOption(e.target.value)}
              >
                {conversionOptions[conversionType].map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name} ({option.symbol})
                  </option>
                ))}
              </select>
              <input 
                type="number" 
                className="flex-1 p-3 border-t border-r border-b rounded-r-lg outline-none text-right"
                value={amount}
                onChange={handleAmountChange}
              />
            </div>
          </div>
          
          {/* Swap Button */}
          <div className="flex justify-center my-2">
            <button 
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
              onClick={handleSwapUnits}
            >
              <ArrowDown size={20} />
            </button>
          </div>
          
          {/* To Unit */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">A</label>
            <div className="flex">
              <select 
                className="flex-1 p-3 border rounded-l-lg outline-none"
                value={toOption}
                onChange={(e) => setToOption(e.target.value)}
              >
                {conversionOptions[conversionType].map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name} ({option.symbol})
                  </option>
                ))}
              </select>
              <input 
                type="text" 
                className="flex-1 p-3 border-t border-r border-b rounded-r-lg outline-none bg-gray-50 text-right"
                value={result}
                readOnly 
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Conversions (Placeholder) */}
      <div className="p-4 bg-white border-t">
        <h3 className="font-medium mb-2">Conversiones recientes</h3>
        <div className="space-y-2">
          <div className="p-2 bg-gray-100 rounded-lg flex justify-between">
            <span>€100 = $109</span>
            <button className="text-blue-500">
              <RotateCcw size={16} />
            </button>
          </div>
          <div className="p-2 bg-gray-100 rounded-lg flex justify-between">
            <span>1kg = 2.20lb</span>
            <button className="text-blue-500">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConverterApp;
