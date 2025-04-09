
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { formatTime, stopMediaStream } from '../utils/mediaUtils';
import { AlertWithClose } from '@/components/ui/alert-with-close';
import PermissionsRequest from '@/components/PermissionsRequest';
import { captureVideo, requestCameraPermissions } from '@/services/PermissionsHandlerNative';

interface VideoCaptureProps {
  onCaptureVideo: (videoUrl: string, duration: number) => void;
  onCancel: () => void;
}

const VideoCapture: React.FC<VideoCaptureProps> = ({ onCaptureVideo, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPermissionsRequest, setShowPermissionsRequest] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const initVideo = async () => {
      try {
        console.log('Verificando permisos para video...');
        const hasPermission = await requestCameraPermissions();

        // Si ya tenemos permisos, iniciamos cámara directamente
        if (hasPermission) {
          console.log('Permisos existentes, iniciando cámara');
          startCamera();
        } else {
          console.log('Sin permisos, mostrando diálogo');
          setShowPermissionsRequest(true);
        }
      } catch (err) {
        console.error('Error en verificación de permisos:', err);
        setError('Error al verificar permisos. Por favor, inténtalo de nuevo.');
      }
    };
    
    initVideo();
    
    // Limpieza al desmontar
    return () => {
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
      stopMediaStream(mediaStreamRef.current);
      mediaStreamRef.current = null;
    };
  }, []);

  const startCamera = async () => {
    try {
      console.log("Iniciando cámara para video...");
      
      // Usamos la nueva función captureVideo
      const videoCapture = await captureVideo();
      if (!videoCapture) {
        setError("No se pudo iniciar la cámara. Verifica los permisos e intenta de nuevo.");
        return;
      }
      
      const { stream, recorder } = videoCapture;
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        try {
          await videoRef.current.play();
          console.log("Reproducción de video iniciada");
          
          // Iniciar grabación automáticamente
          startRecording();
        } catch (playError) {
          console.error("Error al reproducir video:", playError);
          setError("No se pudo iniciar la cámara. Por favor, intenta de nuevo.");
        }
      }
    } catch (error) {
      console.error('Error al acceder a la cámara/micrófono:', error);
      setError("No se pudo acceder a la cámara o micrófono. Por favor, verifica los permisos.");
    }
  };

  const startRecording = () => {
    try {
      console.log("Iniciando grabación de video...");
      
      if (!mediaRecorderRef.current) {
        setError("No se pudo iniciar la grabación. Falta el MediaRecorder.");
        return;
      }
      
      const mediaRecorder = mediaRecorderRef.current;
      videoChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onerror = (event) => {
        console.error("Error en el MediaRecorder de video:", event);
        setError("Error al grabar video. Por favor, intenta de nuevo.");
      };
      
      mediaRecorder.start();
      console.log("Grabación de video iniciada");
      setIsRecording(true);
      setRecordingTime(0);
      
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      setRecordingInterval(interval);
    } catch (error) {
      console.error("Error al iniciar grabación de video:", error);
      setError("No se pudo iniciar la grabación de video. Intenta de nuevo.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaStreamRef.current) {
      console.log("Deteniendo grabación de video...");
      
      try {
        mediaRecorderRef.current.stop();
        
        mediaRecorderRef.current.onstop = () => {
          const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
          const videoUrl = URL.createObjectURL(videoBlob);
          console.log("Video grabado, tamaño:", videoBlob.size);
          
          // Detenemos stream
          stopMediaStream(mediaStreamRef.current);
          
          // Limpiamos intervalo
          if (recordingInterval) {
            clearInterval(recordingInterval);
          }
          
          // Enviamos video
          onCaptureVideo(videoUrl, recordingTime);
        };
      } catch (error) {
        console.error("Error al detener grabación de video:", error);
        setError("Error al finalizar la grabación de video. Intenta de nuevo.");
      }
    } else {
      console.error("No se pudo detener la grabación de video");
      setError("No se pudo completar la grabación de video. Intenta de nuevo.");
    }
  };

  // Manejador de respuesta de permisos
  const handlePermissionResponse = (granted: boolean) => {
    console.log("Respuesta de permisos para video:", granted);
    setShowPermissionsRequest(false);
    
    if (granted) {
      console.log("Permisos concedidos, iniciando cámara para video");
      startCamera();
    } else {
      setError("Para grabar video, es necesario conceder los permisos de cámara y micrófono.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {showPermissionsRequest ? (
        <PermissionsRequest 
          onRequestComplete={handlePermissionResponse}
          permissionType="both" 
        />
      ) : (
        <>
          <div className="bg-black p-3 flex justify-between items-center">
            <div className="text-white">
              {isRecording && (
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-2"></div>
                  <span>{formatTime(recordingTime)}</span>
                </div>
              )}
            </div>
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
          </div>
          
          <div className="bg-black p-4 flex justify-center">
            {isRecording && !error && (
              <button
                onClick={stopRecording}
                className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center"
              >
                <div className="w-8 h-8 rounded bg-white"></div>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VideoCapture;
