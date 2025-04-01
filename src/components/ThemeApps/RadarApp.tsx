
import React, { useState, useEffect } from 'react';
import { Settings, Map, Navigation, MapPin, Sliders } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface RadarAppProps {
  onSettingsClick: () => void;
  hasUnreadMessages?: boolean;
}

interface Radar {
  id: number;
  name: string;
  location: string;
  type: string;
  distance?: number;
}

const RadarApp: React.FC<RadarAppProps> = ({ onSettingsClick, hasUnreadMessages = false }) => {
  const [radars, setRadars] = useState<Radar[]>([]);
  const [loading, setLoading] = useState(true);
  const [radiusKm, setRadiusKm] = useState(50);
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [radarTypes, setRadarTypes] = useState({
    fijo: true,
    tramo: true,
    movil: true
  });
  const isMobile = useIsMobile();

  useEffect(() => {
    // Simular carga de datos
    const loadRadars = () => {
      setLoading(true);
      setTimeout(() => {
        const mockRadars: Radar[] = [
          { id: 1, name: 'Radar A-6 Km 15', location: 'A-6, Madrid', type: 'Fijo', distance: 12 },
          { id: 2, name: 'Radar M-30 Norte', location: 'M-30, Madrid', type: 'Tramo', distance: 5 },
          { id: 3, name: 'Radar A-5 Km 8', location: 'A-5, Madrid', type: 'Fijo', distance: 18 },
          { id: 4, name: 'Radar M-40 Este', location: 'M-40, Madrid', type: 'Tramo', distance: 22 },
          { id: 5, name: 'Radar A-3 Km 22', location: 'A-3, Valencia', type: 'Fijo', distance: 27 },
          { id: 6, name: 'Control Móvil N-V', location: 'N-V Km 35, Madrid', type: 'Móvil', distance: 35 },
          { id: 7, name: 'Radar A-1 Km 29', location: 'A-1, Madrid', type: 'Fijo', distance: 40 },
          { id: 8, name: 'Radar M-50 Oeste', location: 'M-50, Madrid', type: 'Tramo', distance: 15 },
        ];

        // Filtrar por radio seleccionado
        const filteredRadars = mockRadars.filter(radar => radar.distance! <= radiusKm);
        
        // Filtrar por tipos seleccionados
        const typeFilteredRadars = filteredRadars.filter(radar => {
          if (radar.type === 'Fijo' && radarTypes.fijo) return true;
          if (radar.type === 'Tramo' && radarTypes.tramo) return true;
          if (radar.type === 'Móvil' && radarTypes.movil) return true;
          return false;
        });

        setRadars(typeFilteredRadars);
        setLoading(false);
      }, 1000);
    };

    loadRadars();
  }, [radiusKm, radarTypes]);

  const handleRadiusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRadiusKm(Number(event.target.value));
  };

  const handleTypeToggle = (type: 'fijo' | 'tramo' | 'movil') => {
    setRadarTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

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
      
      {/* Tabs */}
      <div className="flex border-b border-white/20">
        <button 
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-2 flex items-center justify-center ${
            activeTab === 'list' ? 'bg-white/20' : 'bg-transparent'
          }`}
        >
          <Navigation size={20} className="mr-2" />
          <span>Lista</span>
        </button>
        <button 
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-2 flex items-center justify-center ${
            activeTab === 'map' ? 'bg-white/20' : 'bg-transparent'
          }`}
        >
          <Map size={20} className="mr-2" />
          <span>Mapa</span>
        </button>
      </div>
      
      {/* Filter Bar */}
      <div className="bg-white/10 p-3">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span>Radio de búsqueda: {radiusKm} km</span>
            <button 
              onClick={() => setRadiusKm(50)} 
              className="text-xs bg-white/20 px-2 py-1 rounded"
            >
              Reset
            </button>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={radiusKm}
            onChange={handleRadiusChange}
            className="w-full"
          />
        </div>
        
        <div className="flex mt-2 space-x-2">
          <button 
            onClick={() => handleTypeToggle('fijo')}
            className={`px-2 py-1 text-sm rounded flex-1 ${
              radarTypes.fijo ? 'bg-white/30' : 'bg-white/10'
            }`}
          >
            Fijos
          </button>
          <button 
            onClick={() => handleTypeToggle('tramo')}
            className={`px-2 py-1 text-sm rounded flex-1 ${
              radarTypes.tramo ? 'bg-white/30' : 'bg-white/10'
            }`}
          >
            Tramo
          </button>
          <button 
            onClick={() => handleTypeToggle('movil')}
            className={`px-2 py-1 text-sm rounded flex-1 ${
              radarTypes.movil ? 'bg-white/30' : 'bg-white/10'
            }`}
          >
            Móviles
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col p-4">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse">Cargando radares...</div>
          </div>
        ) : (
          activeTab === 'list' ? (
            // Lista de radares
            <div className="flex-1 overflow-auto">
              {radars.length === 0 ? (
                <div className="bg-white/20 rounded-lg p-4 text-center">
                  <p>No se encontraron radares en el radio seleccionado.</p>
                </div>
              ) : (
                radars.map((radar) => (
                  <div key={radar.id} className="bg-white/20 rounded-lg p-4 mb-3">
                    <h3 className="font-medium">{radar.name}</h3>
                    <div className="flex justify-between mt-2 text-sm">
                      <span>{radar.location}</span>
                      <span className="bg-red-700 px-2 py-1 rounded text-xs">
                        {radar.type}
                      </span>
                    </div>
                    <div className="mt-2 text-xs">
                      <span>Distancia: {radar.distance} km</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Mapa de radares
            <div className="flex-1 relative bg-gray-300 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center bg-red-500/10">
                <div className="text-center">
                  <MapPin size={40} className="mx-auto mb-2" />
                  <p>Mapa de radares</p>
                  <p className="text-sm mt-2">
                    Mostrando {radars.length} radares en un radio de {radiusKm}km
                  </p>
                </div>
              </div>
              
              {/* Marcadores de radar - Simulados */}
              {radars.map((radar) => (
                <div 
                  key={radar.id}
                  className="absolute w-4 h-4 bg-red-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${20 + Math.random() * 60}%`,
                  }}
                >
                  <span className="absolute top-4 left-4 text-xs whitespace-nowrap bg-black/70 px-1 rounded">
                    {radar.name}
                  </span>
                </div>
              ))}
              
              {/* Posición actual - Simulada */}
              <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-blue-500 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <span className="text-white text-xs">Yo</span>
              </div>
            </div>
          )
        )}
        
        {/* Footer info */}
        <div className="mt-4 p-3 bg-white/10 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm">
              {isMobile 
                ? `${radars.length} radares encontrados` 
                : `Mostrando ${radars.length} radares en el área seleccionada`}
            </p>
          </div>
          <button className="bg-white/20 p-2 rounded-full">
            <Sliders size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RadarApp;
