
import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import GenericAppTemplate from './GenericAppTemplate';
import PermissionsRequest from '@/components/PermissionsRequest';
import { AlertWithClose } from '@/components/ui/alert-with-close';

interface ScannerAppProps {
  onSettingsClick: () => void;
  hasUnreadMessages?: boolean;
  logoAura?: 'none' | 'green' | 'red';
}

const ScannerApp: React.FC<ScannerAppProps> = ({ onSettingsClick, hasUnreadMessages = false, logoAura = 'none' }) => {
  const [showPermissionsRequest, setShowPermissionsRequest] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const handleScanClick = () => {
    setShowPermissionsRequest(true);
  };

  const handlePermissionResponse = (granted: boolean) => {
    setShowPermissionsRequest(false);
    if (!granted) {
      setPermissionError("Para usar el escáner, es necesario conceder permisos de cámara.");
    } else {
      // Simulamos el proceso de escaneo
      setTimeout(() => {
        alert("Escaneo completado");
      }, 500);
    }
  };

  return (
    <div className="h-full relative">
      <GenericAppTemplate
        title="Escáner"
        icon="📷"
        color="bg-gradient-to-b from-red-400 to-red-600 text-white"
        onSettingsClick={onSettingsClick}
        hasUnreadMessages={hasUnreadMessages}
        logoAura={logoAura}
      />
      
      {/* Añadimos contenido funcional al app de escáner */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-16 p-4">
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          <div 
            className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6 cursor-pointer"
            onClick={handleScanClick}
          >
            <Camera className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-center">Toca para escanear</h2>
          <p className="text-gray-500 text-center">
            Puedes escanear documentos, códigos QR o códigos de barras
          </p>
          
          {permissionError && (
            <div className="mt-6 w-full max-w-md">
              <AlertWithClose 
                variant="destructive" 
                onClose={() => setPermissionError(null)}
              >
                {permissionError}
              </AlertWithClose>
            </div>
          )}
        </div>
      </div>
      
      {showPermissionsRequest && (
        <PermissionsRequest 
          onRequestComplete={handlePermissionResponse}
          permissionType="camera"
        />
      )}
    </div>
  );
};

export default ScannerApp;
