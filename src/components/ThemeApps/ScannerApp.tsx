
import React, { useState, useRef } from 'react';
import { Settings, Upload, Camera, Image, Scan, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';

interface ScannerAppProps {
  onSettingsClick: () => void;
  hasUnreadMessages?: boolean;
}

const ScannerApp: React.FC<ScannerAppProps> = ({ onSettingsClick, hasUnreadMessages = false }) => {
  const [activeTab, setActiveTab] = useState<'scan'|'gallery'>('scan');
  const [scanning, setScanning] = useState(false);
  const [scannedDocuments, setScannedDocuments] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  // Función para simular el escaneo de documentos
  const handleScan = () => {
    setScanning(true);
    
    // Simular escaneo
    setTimeout(() => {
      // Crear una imagen simulada con timestamp para hacerla única
      const timestamp = new Date().getTime();
      const mockDocument = `document-${timestamp}.jpg`;
      
      setScannedDocuments(prev => [mockDocument, ...prev]);
      setScanning(false);
      
      // Auto cambiar a la galería cuando hay documentos
      if (scannedDocuments.length === 0) {
        setActiveTab('gallery');
      }
    }, 2000);
  };
  
  // Manejador para abrir el selector de archivos
  const handleBrowseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Manejador para subir archivos seleccionados
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Crear URLs para los archivos seleccionados
      const newDocuments = Array.from(files).map(file => URL.createObjectURL(file));
      setScannedDocuments(prev => [...newDocuments, ...prev]);
      
      // Cambiar a la galería
      setActiveTab('gallery');
    }
  };
  
  // Eliminar documento de la galería
  const handleDeleteDocument = (index: number) => {
    setScannedDocuments(docs => docs.filter((_, i) => i !== index));
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
                  <p className="mt-4 text-gray-500">{t('scanning')}</p>
                </div>
              ) : (
                <>
                  <Camera className="h-16 w-16 text-gray-400" />
                  <p className="mt-4 text-gray-500">
                    {isMobile ? t('tap_scan') : t('click_scan')}
                  </p>
                  <button 
                    onClick={handleScan}
                    className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {t('scan_now')}
                  </button>
                </>
              )}
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-500 text-center">
                {t('supported_formats')}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*, application/pdf" 
              onChange={handleFileUpload}
              multiple
            />
            
            {scannedDocuments.length === 0 ? (
              <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
                <Upload className="h-16 w-16 text-gray-400" />
                <p className="mt-4 text-gray-500">
                  Arrastre y suelte documentos o
                </p>
                <button 
                  onClick={handleBrowseFiles}
                  className="mt-4 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {t('browse_files')}
                </button>
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {scannedDocuments.map((doc, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                      {doc.endsWith('.pdf') ? (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-gray-500">PDF</p>
                        </div>
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                          {doc.startsWith('document-') ? (
                            <p className="text-xs text-gray-500">Documento escaneado</p>
                          ) : (
                            <img 
                              src={doc} 
                              alt={`Document ${index}`} 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'placeholder.svg';
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => handleDeleteDocument(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <div 
                  onClick={handleBrowseFiles}
                  className="aspect-square bg-gray-100 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <Upload size={24} className="text-gray-400" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerApp;
