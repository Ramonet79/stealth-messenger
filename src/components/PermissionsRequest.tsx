
import React, { useEffect, useState } from 'react';
import { Shield, Camera as CameraIcon, Mic, X } from 'lucide-react';
import { Button } from './ui/button';
import { AlertWithClose } from './ui/alert-with-close';
import { 
  checkCameraPermissions, 
  requestCameraPermissions
} from '@/services/PermissionsHandlerNative';

interface PermissionsRequestProps {
  onRequestComplete: (granted: boolean) => void;
  permissionType: 'camera' | 'microphone' | 'both';
}

const PermissionsRequest: React.FC<PermissionsRequestProps> = ({ 
  onRequestComplete, 
  permissionType 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTriedStandardRequest, setHasTriedStandardRequest] = useState(false);
  
  // Verificar permisos al montar el componente
  useEffect(() => {
    const checkExistingPermissions = async () => {
      try {
        // Solo verificamos permisos de cámara, ya que es lo que podemos manejar con el plugin
        const hasPermissions = await checkCameraPermissions();
        console.log('¿Tiene permisos ya concedidos?', hasPermissions);
        
        if (hasPermissions) {
          console.log('Ya tenemos permisos, completando solicitud...');
          // Esperamos un poco antes de continuar
          setTimeout(() => {
            onRequestComplete(true);
          }, 500);
        }
      } catch (err) {
        console.error('Error al verificar permisos existentes:', err);
      }
    };
    
    checkExistingPermissions();
  }, [onRequestComplete]);

  // Solicitar permisos al usuario
  const handleRequestPermissions = async () => {
    setLoading(true);
    setError(null);
    console.log('Botón de solicitud de permisos presionado');
    
    try {
      // Esperamos un poco para evitar problemas de timing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Solicitar permisos basados en el tipo
      let granted = false;
      
      if (permissionType === 'camera' || permissionType === 'both') {
        granted = await requestCameraPermissions();
      } else if (permissionType === 'microphone') {
        // Para micrófono, usamos una solicitud manual
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
            granted = true;
          }
        } catch (e) {
          console.error('Error al solicitar permisos de micrófono:', e);
        }
      }
      
      console.log('Resultado de solicitud de permisos:', granted);
      
      // Esperamos un poco más antes de continuar
      setTimeout(() => {
        if (granted) {
          onRequestComplete(true);
        } else {
          setError("No se pudieron obtener los permisos necesarios. Por favor, inténtalo de nuevo o verifica la configuración de tu dispositivo.");
          setHasTriedStandardRequest(true);
        }
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error al solicitar permisos:', err);
      setError(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      setLoading(false);
      setHasTriedStandardRequest(true);
    }
  };

  // Cancelar solicitud de permisos
  const cancelRequest = () => {
    onRequestComplete(false);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Shield className="h-6 w-6 text-blue-500" />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-center mb-4">Permisos necesarios</h2>
        
        <p className="text-gray-600 text-center mb-6">
          Esta aplicación necesita acceso a {permissionType === 'camera' 
            ? 'tu cámara' 
            : permissionType === 'microphone' 
              ? 'tu micrófono' 
              : 'tu cámara y micrófono'} para funcionar correctamente.
        </p>
        
        <div className="space-y-4 mb-6">
          {(permissionType === 'camera' || permissionType === 'both') && (
            <div className="flex items-center">
              <div className="bg-gray-100 p-2 rounded-full mr-3">
                <CameraIcon className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">Cámara</p>
                <p className="text-sm text-gray-500">Para enviar fotos y videos</p>
              </div>
            </div>
          )}
          
          {(permissionType === 'microphone' || permissionType === 'both') && (
            <div className="flex items-center">
              <div className="bg-gray-100 p-2 rounded-full mr-3">
                <Mic className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">Micrófono</p>
                <p className="text-sm text-gray-500">Para enviar mensajes de audio y videos con sonido</p>
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <AlertWithClose 
            variant="destructive" 
            onClose={() => setError(null)} 
            className="mb-4"
          >
            {error}
          </AlertWithClose>
        )}
        
        <div className="flex flex-col space-y-2">
          {loading ? (
            <Button disabled className="w-full">
              Solicitando permisos...
            </Button>
          ) : (
            <Button 
              onClick={handleRequestPermissions} 
              className="w-full"
            >
              {hasTriedStandardRequest ? "Intentar de nuevo" : "Conceder permisos"}
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={cancelRequest} 
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PermissionsRequest;
