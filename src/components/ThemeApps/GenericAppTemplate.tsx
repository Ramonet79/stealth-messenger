
import React from 'react';
import { Settings } from 'lucide-react';

interface GenericAppProps {
  onSettingsClick: () => void;
  hasUnreadMessages?: boolean;
  title: string;
  icon: string;
  color: string;
  logoAura?: 'none' | 'green' | 'red';
}

const GenericAppTemplate: React.FC<GenericAppProps> = ({ 
  onSettingsClick, 
  hasUnreadMessages = false,
  title,
  icon,
  color,
  logoAura = 'none'
}) => {
  return (
    <div className={`flex flex-col h-full ${color}`}>
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <h1 className="text-xl font-semibold">{title}</h1>
        <button 
          onClick={onSettingsClick} 
          className="p-2 rounded-full hover:bg-white/10 transition-colors relative"
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
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <h2 className="text-2xl font-medium mb-4">{title}</h2>
        <p className="text-lg opacity-80 max-w-xs">
          Esta aplicación está funcional como camuflaje. Toca el icono de configuración para acceder a la mensajería.
        </p>
      </div>
    </div>
  );
};

export default GenericAppTemplate;
