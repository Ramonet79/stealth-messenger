
import React, { useRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { stopMediaStream, requestMediaPermissions } from '../utils/mediaUtils';
import { AlertWithClose } from '@/components/ui/alert-with-close';
import PermissionsRequest from '@/components/PermissionsRequest';

interface ImageCaptureProps {
  onCaptureImage: (imageUrl: string) => void;
  onCancel: () => void;
}

const ImageCapture: React.FC<ImageCaptureProps> = ({ onCaptureImage, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPermissionsRequest, setShowPermissionsRequest] = useState(false);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const hasPermission = await requestMediaPermissions('camera', (show) => {
          console.log("Setting permissions dialog visible:", show);
          setShowPermissionsRequest(show);
        });

        // Si ya tenemos permisos, iniciamos la cámara directamente
        if (hasPermission) {
          startCamera();
        }
      } catch (err) {
        console.error('Error en verificación de permisos:', err);
        setError('Error al verificar permisos. Por favor, inténtalo de nuevo.');
      }
    };
    
    initCamera();
    
    // Limpieza al desmontar
    return () => {
      stopMediaStream(mediaStreamRef.current);
      mediaStreamRef.current = null;
    };
  }, []);

  const startCamera = async () => {
    try {
      console.log("Iniciando cámara...");
      
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        videoRef.current.srcObject = stream;
        mediaStreamRef.current = stream;
        
        try {
          await videoRef.current.play();
          console.log("Reproducción de video iniciada");
        } catch (playError) {
          console.error("Error al reproducir el video:", playError);
          setError("No se pudo iniciar la cámara. Por favor, intenta de nuevo.");
        }
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      setError("No se pudo acceder a la cámara. Por favor, verifica los permisos.");
    }
  };

  const handleCaptureImage = () => {
    if (videoRef.current && canvasRef.current && mediaStreamRef.current) {
      console.log("Capturando imagen...");
      const context = canvasRef.current.getContext('2d');
      
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        const imageUrl = canvasRef.current.toDataURL('image/jpeg');
        console.log("Imagen capturada correctamente");
        
        // Detenemos el stream
        stopMediaStream(mediaStreamRef.current);
        mediaStreamRef.current = null;
        
        // Enviamos la imagen
        onCaptureImage(imageUrl);
      }
    } else {
      console.error("No se pudo capturar la imagen");
      setError("No se pudo capturar la imagen. Intenta de nuevo.");
    }
  };

  // Manejador de respuesta de permisos - ahora inicia la cámara cuando se conceden permisos
  const handlePermissionResponse = (granted: boolean) => {
    console.log("Respuesta de permisos recibida:", granted);
    setShowPermissionsRequest(false);
    
    if (granted) {
      console.log("Permisos concedidos, iniciando cámara");
      startCamera();
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
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                muted
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          <div className="bg-black p-4 flex justify-center">
            <button
              onClick={handleCaptureImage}
              className="w-16 h-16 rounded-full bg-white flex items-center justify-center"
              disabled={!!error || !mediaStreamRef.current}
            >
              <div className="w-14 h-14 rounded-full border-4 border-black"></div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageCapture;
