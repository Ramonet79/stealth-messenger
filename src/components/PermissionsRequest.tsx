
import React, { useState, useEffect } from 'react';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { AlertWithClose } from './ui/alert-with-close';
import { Button } from './ui/button';
import { Shield, Camera as CameraIcon, Mic, X } from 'lucide-react';
import { checkMediaPermissions } from './Messenger/utils/mediaUtils';

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
  const [permissionRequested, setPermissionRequested] = useState(false);

  // Verificar permisos al montar el componente y cuando se solicitan
  useEffect(() => {
    // Si ya se solicitaron permisos, comprobar si se concedieron
    if (permissionRequested) {
      const checkPermissionsStatus = async () => {
        console.log("Verificando estado de permisos después de solicitarlos...");
        // Pequeña pausa para dar tiempo a que se procesen los permisos
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          const hasPermissions = await checkMediaPermissions(permissionType);
          console.log(`Resultado de verificación de permisos: ${hasPermissions}`);
          
          if (hasPermissions) {
            console.log("Permisos concedidos, completando solicitud");
            onRequestComplete(true);
          } else {
            console.log("Permisos no concedidos después de solicitarlos");
            setError('No se pudieron obtener los permisos necesarios. Por favor, actívalos manualmente en la configuración de tu dispositivo.');
            onRequestComplete(false);
          }
        } catch (err) {
          console.error('Error verificando permisos:', err);
          setError('Ocurrió un error al verificar el estado de los permisos');
          onRequestComplete(false);
        } finally {
          setLoading(false);
        }
      };
      
      checkPermissionsStatus();
    }
  }, [permissionRequested, permissionType, onRequestComplete]);

  const requestPermissions = async () => {
    setLoading(true);
    setError(null);

    try {
      if (Capacitor.isNativePlatform()) {
        console.log("Solicitando permisos en plataforma nativa...");
        
        if (permissionType === 'camera' || permissionType === 'both') {
          console.log("Solicitando permiso de cámara...");
          const cameraPermission = await Camera.requestPermissions();
          console.log("Resultado permiso cámara:", cameraPermission);
        }

        // Para permisos de micrófono en plataformas nativas
        if (permissionType === 'microphone' || permissionType === 'both') {
          console.log("Solicitando permiso de micrófono...");
          try {
            // En Android, el permiso de micrófono puede solicitarse directamente con getUserMedia
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Detener el stream después de obtener permisos
            stream.getTracks().forEach(track => track.stop());
            console.log("Permiso de micrófono concedido");
          } catch (err) {
            console.error('Error solicitando permiso de micrófono:', err);
            throw err;
          }
        }
        
        // Marcar que ya se solicitaron los permisos para activar el useEffect
        setPermissionRequested(true);
        return;
      } else {
        // En web
        console.log("Solicitando permisos en plataforma web...");
        try {
          const constraints: MediaStreamConstraints = {};
          
          if (permissionType === 'camera' || permissionType === 'both') {
            constraints.video = true;
          }
          
          if (permissionType === 'microphone' || permissionType === 'both') {
            constraints.audio = true;
          }
          
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          // Detener el stream después de obtener permisos
          stream.getTracks().forEach(track => track.stop());
          onRequestComplete(true);
        } catch (err) {
          console.error('Error solicitando permisos:', err);
          setError('No se pudieron obtener los permisos necesarios');
          onRequestComplete(false);
        }
      }
    } catch (err) {
      console.error('Error general solicitando permisos:', err);
      setError('Ocurrió un error al solicitar permisos');
      onRequestComplete(false);
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
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
          <Button 
            onClick={requestPermissions} 
            disabled={loading || permissionRequested} 
            className="w-full"
          >
            {loading ? 'Solicitando permisos...' : 
             permissionRequested ? 'Permisos solicitados...' : 'Conceder permisos'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => onRequestComplete(false)} 
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
