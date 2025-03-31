
import React, { useState, useEffect } from 'react';
import GenericAppTemplate from './GenericAppTemplate';
import { Settings } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface RadarAppProps {
  onSettingsClick: () => void;
  hasUnreadMessages?: boolean;
}

const RadarApp: React.FC<RadarAppProps> = ({ onSettingsClick, hasUnreadMessages = false }) => {
  const [radars, setRadars] = useState<Array<{id: number, name: string, location: string, type: string}>>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setRadars([
        { id: 1, name: 'Radar A-6 Km 15', location: 'A-6, Madrid', type: 'Fijo' },
        { id: 2, name: 'Radar M-30 Norte', location: 'M-30, Madrid', type: 'Tramo' },
        { id: 3, name: 'Radar A-5 Km 8', location: 'A-5, Madrid', type: 'Fijo' },
        { id: 4, name: 'Radar M-40 Este', location: 'M-40, Madrid', type: 'Tramo' },
        { id: 5, name: 'Radar A-3 Km 22', location: 'A-3, Valencia', type: 'Fijo' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-red-400 to-red-600 text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <h1 className="text-xl font-semibold">Radares</h1>
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
      
      {/* Content */}
      <div className="flex-1 flex flex-col p-4">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse">Cargando radares...</div>
          </div>
        ) : (
          <>
            <div className="bg-white/10 rounded-lg p-3 mb-4">
              <h2 className="font-medium mb-2">Radares cercanos</h2>
              <p className="text-sm">Mostrando radares en un radio de 50km</p>
            </div>
            
            <div className="flex-1 overflow-auto">
              {radars.map((radar) => (
                <div key={radar.id} className="bg-white/20 rounded-lg p-4 mb-3">
                  <h3 className="font-medium">{radar.name}</h3>
                  <div className="flex justify-between mt-2 text-sm">
                    <span>{radar.location}</span>
                    <span className="bg-red-700 px-2 py-1 rounded text-xs">
                      {radar.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-white/10 rounded-lg text-center">
              <p className="text-sm">
                {isMobile 
                  ? "Pulse sobre el mapa para ver detalles" 
                  : "Haga clic en el mapa para ver detalles"}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RadarApp;
