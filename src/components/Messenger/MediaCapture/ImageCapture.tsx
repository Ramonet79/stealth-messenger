
import React, { useRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { stopMediaStream } from '../utils/mediaUtils';
import { AlertWithClose } from '@/components/ui/alert-with-close';

interface ImageCaptureProps {
  onCaptureImage: (imageUrl: string) => void;
  onCancel: () => void;
}

const ImageCapture: React.FC<ImageCaptureProps> = ({ onCaptureImage, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize camera when component mounts
    const startCamera = async () => {
      try {
        console.log("Intentando acceder a la cámara...");
        if (videoRef.current) {
          // Solicitamos permisos explícitamente
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          
          console.log("Permiso de cámara concedido, configurando stream...");
          videoRef.current.srcObject = stream;
          mediaStreamRef.current = stream;
          
          // Asegurarse de que el video se reproduce
          try {
            await videoRef.current.play();
            console.log("Reproducción de video iniciada con éxito");
          } catch (playError) {
            console.error("Error al reproducir el video:", playError);
            setError("No se pudo iniciar la cámara. Por favor, intenta de nuevo.");
          }
        }
      } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        setError("No se pudo acceder a la cámara. Por favor, verifica los permisos.");
        // No llamamos a onCancel aquí para darle al usuario la posibilidad de ver el error
      }
    };

    startCamera();

    // Cleanup when component unmounts
    return () => {
      console.log("Limpiando recursos de la cámara");
      stopMediaStream(mediaStreamRef.current);
      mediaStreamRef.current = null;
    };
  }, []);

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
        
        // Stop the video stream
        stopMediaStream(mediaStreamRef.current);
        mediaStreamRef.current = null;
        
        // Send the image
        onCaptureImage(imageUrl);
      }
    } else {
      console.error("No se pudo capturar la imagen - referencias no disponibles");
      setError("No se pudo capturar la imagen. Intenta de nuevo.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
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
          disabled={!!error}
        >
          <div className="w-14 h-14 rounded-full border-4 border-black"></div>
        </button>
      </div>
    </div>
  );
};

export default ImageCapture;
