
import React, { useState } from 'react';
import { Settings, Upload, Camera, Image, Scan } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ScannerAppProps {
  onSettingsClick: () => void;
  hasUnreadMessages?: boolean;
}

const ScannerApp: React.FC<ScannerAppProps> = ({ onSettingsClick, hasUnreadMessages = false }) => {
  const [activeTab, setActiveTab] = useState<'scan'|'gallery'>('scan');
  const [scanning, setScanning] = useState(false);
  const isMobile = useIsMobile();

  const handleScan = () => {
    setScanning(true);
    
    // Simular escaneo
    setTimeout(() => {
      setScanning(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center bg-gradient-to-b from-gray-500 to-gray-700 p-4 text-white">
        <h1 className="text-xl font-semibold">Scanner</h1>
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
      <div className="flex border-b">
        <button 
          className={`flex-1 py-3 flex items-center justify-center space-x-2 ${
            activeTab === 'scan' ? 'bg-white text-gray-800' : 'bg-gray-200 text-gray-600'
          }`}
          onClick={() => setActiveTab('scan')}
        >
          <Camera size={18} />
          <span>Escanear</span>
        </button>
        <button 
          className={`flex-1 py-3 flex items-center justify-center space-x-2 ${
            activeTab === 'gallery' ? 'bg-white text-gray-800' : 'bg-gray-200 text-gray-600'
          }`}
          onClick={() => setActiveTab('gallery')}
        >
          <Image size={18} />
          <span>Galería</span>
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4">
        {activeTab === 'scan' ? (
          <div className="flex flex-col h-full">
            <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
              {scanning ? (
                <div className="animate-pulse flex flex-col items-center">
                  <Scan className="h-16 w-16 text-gray-400 animate-bounce" />
                  <p className="mt-4 text-gray-500">Escaneando...</p>
                </div>
              ) : (
                <>
                  <Camera className="h-16 w-16 text-gray-400" />
                  <p className="mt-4 text-gray-500">
                    {isMobile ? "Pulse para escanear" : "Haga clic para escanear un documento"}
                  </p>
                  <button 
                    onClick={handleScan}
                    className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Escanear ahora
                  </button>
                </>
              )}
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-500 text-center">
                Formatos soportados: PDF, JPG, PNG
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
              <Upload className="h-16 w-16 text-gray-400" />
              <p className="mt-4 text-gray-500">
                Arrastre y suelte documentos o
              </p>
              <button 
                className="mt-4 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Explorar archivos
              </button>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="aspect-square bg-gray-200 rounded-md flex items-center justify-center">
                <p className="text-gray-500 text-xs">Vacío</p>
              </div>
              <div className="aspect-square bg-gray-200 rounded-md flex items-center justify-center">
                <p className="text-gray-500 text-xs">Vacío</p>
              </div>
              <div className="aspect-square bg-gray-200 rounded-md flex items-center justify-center">
                <p className="text-gray-500 text-xs">Vacío</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerApp;
