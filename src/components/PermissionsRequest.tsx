
import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';
import { AlertWithClose } from './ui/alert-with-close';
import { Button } from './ui/button';
import { Shield, Camera as CameraIcon, Mic, X } from 'lucide-react';

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

  // Función simplificada para manejar permisos
  const requestPermissions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Solicitando permisos de ${permissionType}...`);
      
      // Si estamos en una plataforma nativa
      if (Capacitor.isNativePlatform()) {
        console.log("En plataforma nativa");
        
        if (permissionType === 'camera' || permissionType === 'both') {
          const cameraPermissions = await Camera.requestPermissions();
          console.log("Resultado permiso cámara:", cameraPermissions);
        }
        
        if (permissionType === 'microphone' || permissionType === 'both') {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            console.log("Permiso de micrófono concedido");
          } catch (err) {
            console.error("Error solicitando permisos de micrófono:", err);
            throw new Error("No se pudo obtener acceso al micrófono");
          }
        }
      } 
      // Si estamos en web
      else {
        console.log("En plataforma web");
        const constraints: MediaStreamConstraints = {};
        
        if (permissionType === 'camera' || permissionType === 'both') {
          constraints.video = true;
        }
        
        if (permissionType === 'microphone' || permissionType === 'both') {
          constraints.audio = true;
        }
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Si llegamos aquí, es que los permisos se han concedido
      console.log("Permisos concedidos correctamente");
      onRequestComplete(true);
      
    } catch (err) {
      console.error("Error solicitando permisos:", err);
      setError("No se pudieron obtener los permisos necesarios. Por favor, concede los permisos en la configuración de tu dispositivo.");
      onRequestComplete(false);
    } finally {
      setLoading(false);
    }
  };

  // Cancelar solicitud de permisos
  const cancelRequest = () => {
    onRequestComplete(false);
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
            disabled={loading} 
            className="w-full"
          >
            {loading ? 'Solicitando permisos...' : 'Conceder permisos'}
          </Button>
          
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
