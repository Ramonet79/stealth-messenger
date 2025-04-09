
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AlertWithClose } from '@/components/ui/alert-with-close';
import PermissionsRequest from '@/components/PermissionsRequest';
import { 
  checkCameraPermissions, 
  takePicture 
} from '@/services/PermissionsHandlerNative';

interface ImageCaptureProps {
  onCaptureImage: (imageUrl: string) => void;
  onCancel: () => void;
}

const ImageCapture: React.FC<ImageCaptureProps> = ({ onCaptureImage, onCancel }) => {
  const [error, setError] = useState<string | null>(null);
  const [showPermissionsRequest, setShowPermissionsRequest] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Verificar permisos al montar el componente
  React.useEffect(() => {
    const checkPermissions = async () => {
      try {
        const hasPermission = await checkCameraPermissions();
        
        if (hasPermission) {
          // Si ya tenemos permisos, intentamos tomar foto directamente
          handleTakePhoto();
        } else {
          // Si no tenemos permisos, mostramos el diálogo
          console.log("Necesitamos solicitar permisos...");
          setShowPermissionsRequest(true);
        }
      } catch (err) {
        console.error('Error en verificación de permisos:', err);
        setError('Error al verificar permisos. Por favor, inténtalo de nuevo.');
      }
    };
    
    // Esperamos un poco antes de iniciar el proceso
    setTimeout(() => {
      checkPermissions();
    }, 500);
  }, []);

  const handleTakePhoto = async () => {
    setLoading(true);
    
    try {
      console.log("Tomando foto...");
      const photoUrl = await takePicture();
      
      if (photoUrl) {
        console.log("Foto tomada correctamente");
        onCaptureImage(photoUrl);
      } else {
        console.error("No se pudo obtener la foto");
        setError("No se pudo capturar la imagen. Intenta de nuevo.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error al tomar foto:", error);
      setError("Error al tomar la foto: " + (error instanceof Error ? error.message : "Error desconocido"));
      setLoading(false);
    }
  };

  // Manejador de respuesta de permisos
  const handlePermissionResponse = (granted: boolean) => {
    console.log("Respuesta de permisos recibida:", granted);
    setShowPermissionsRequest(false);
    
    if (granted) {
      console.log("Permisos concedidos, tomando foto...");
      // Añadimos un pequeño retraso para evitar problemas de timing
      setTimeout(() => {
        handleTakePhoto();
      }, 1000);
    } else {
      setError("Para usar la cámara, es necesario conceder los permisos.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {showPermissionsRequest ? (
        <PermissionsRequest 
          onRequestComplete={handlePermissionResponse} 
          permissionType="camera" 
        />
      ) : (
        <>
          <div className="bg-black p-3 flex justify-between items-center">
            <div className="text-white">Cámara</div>
            <button
              onClick={onCancel}
              className="p-2 rounded-full bg-gray-800 text-white"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center bg-black">
            {error ? (
              <AlertWithClose onClose={onCancel} variant="destructive" className="m-4">
                {error}
              </AlertWithClose>
            ) : loading ? (
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Capturando imagen...</p>
              </div>
            ) : (
              <div className="text-white text-center p-4">
                <p>Preparando cámara...</p>
              </div>
            )}
          </div>
          
          {!error && !loading && (
            <div className="bg-black p-4 flex justify-center">
              <button
                onClick={handleTakePhoto}
                className="w-16 h-16 rounded-full bg-white flex items-center justify-center"
              >
                <div className="w-14 h-14 rounded-full border-4 border-black"></div>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImageCapture;
