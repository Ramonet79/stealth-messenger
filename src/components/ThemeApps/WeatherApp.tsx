
import React, { useState, useEffect } from 'react';
import { Settings, Cloud, CloudRain, Sun, CloudSun, Compass } from 'lucide-react';

interface WeatherAppProps {
  onSettingsClick: () => void;
  hasUnreadMessages?: boolean;
}

interface WeatherData {
  location: string;
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy';
  humidity: number;
  wind: number;
}

const WeatherApp: React.FC<WeatherAppProps> = ({ onSettingsClick, hasUnreadMessages = false }) => {
  const [weatherData, setWeatherData] = useState<WeatherData>({
    location: 'Madrid',
    temperature: 23,
    condition: 'sunny',
    humidity: 45,
    wind: 10
  });

  const [forecastDays, setForecastDays] = useState([
    { day: 'Lun', temp: 22, condition: 'sunny' },
    { day: 'Mar', temp: 24, condition: 'partly-cloudy' },
    { day: 'Mié', temp: 25, condition: 'partly-cloudy' },
    { day: 'Jue', temp: 21, condition: 'rainy' },
    { day: 'Vie', temp: 20, condition: 'cloudy' }
  ]);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return <Sun size={24} className="text-yellow-500" />;
      case 'cloudy':
        return <Cloud size={24} className="text-gray-500" />;
      case 'rainy':
        return <CloudRain size={24} className="text-blue-500" />;
      case 'partly-cloudy':
        return <CloudSun size={24} className="text-yellow-400" />;
      default:
        return <Sun size={24} className="text-yellow-500" />;
    }
  };

  const simulateWeatherChange = () => {
    const conditions = ['sunny', 'cloudy', 'rainy', 'partly-cloudy'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)] as 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy';
    const randomTemp = Math.floor(Math.random() * 10) + 18; // Temperature between 18-28
    
    setWeatherData({
      ...weatherData,
      temperature: randomTemp,
      condition: randomCondition,
    });
  };

  // Simular cambios de clima cada 30 segundos
  useEffect(() => {
    const interval = setInterval(simulateWeatherChange, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-400 to-blue-600 text-white">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4">
        <h1 className="text-xl font-semibold">El Tiempo</h1>
        <button 
          onClick={onSettingsClick} 
          className="p-2 rounded-full hover:bg-white/10 transition-colors relative"
        >
          <Settings size={24} />
          {hasUnreadMessages && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
          )}
        </button>
      </div>
      
      {/* Current Weather */}
      <div className="flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl">{weatherData.location}</h2>
        <div className="flex items-center mt-4">
          {weatherData.condition === 'sunny' && <Sun size={80} className="text-yellow-300" />}
          {weatherData.condition === 'cloudy' && <Cloud size={80} className="text-gray-200" />}
          {weatherData.condition === 'rainy' && <CloudRain size={80} className="text-blue-200" />}
          {weatherData.condition === 'partly-cloudy' && <CloudSun size={80} className="text-yellow-200" />}
          <span className="text-6xl ml-4">{weatherData.temperature}°</span>
        </div>
      </div>
      
      {/* Weather Details */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-white/10 rounded-lg mx-4">
        <div className="flex items-center">
          <Cloud className="mr-2" />
          <div>
            <p className="text-sm">Humedad</p>
            <p className="font-medium">{weatherData.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center">
          <Compass className="mr-2" />
          <div>
            <p className="text-sm">Viento</p>
            <p className="font-medium">{weatherData.wind} km/h</p>
          </div>
        </div>
      </div>
      
      {/* Forecast */}
      <div className="flex-1 mt-4">
        <h3 className="text-lg font-medium px-4 mb-2">Próximos días</h3>
        <div className="flex justify-between px-4">
          {forecastDays.map((day, index) => (
            <div key={index} className="flex flex-col items-center">
              <p className="text-sm">{day.day}</p>
              {getWeatherIcon(day.condition)}
              <p className="mt-1">{day.temp}°</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="grid grid-cols-3 gap-1 p-4 bg-white/10 mt-auto">
        <button className="p-3 rounded-lg flex flex-col items-center">
          <Cloud size={24} />
          <span className="text-xs mt-1">Pronóstico</span>
        </button>
        <button className="p-3 rounded-lg flex flex-col items-center">
          <Compass size={24} />
          <span className="text-xs mt-1">Mapa</span>
        </button>
        <button className="p-3 rounded-lg flex flex-col items-center">
          <Settings size={24} />
          <span className="text-xs mt-1">Ajustes</span>
        </button>
      </div>
    </div>
  );
};

export default WeatherApp;
