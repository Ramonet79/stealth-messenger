
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { formatTime, stopMediaStream, requestMediaPermissions } from '../utils/mediaUtils';
import { AlertWithClose } from '@/components/ui/alert-with-close';
import PermissionsRequest from '@/components/PermissionsRequest';

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
    // Initialize camera when component mounts (if permissions granted)
    if (!showPermissionsRequest) {
      startCamera();
    }

    // Cleanup when component unmounts
    return () => {
      console.log("Limpiando recursos de video");
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
      stopMediaStream(mediaStreamRef.current);
      mediaStreamRef.current = null;
      mediaRecorderRef.current = null;
    };
  }, [showPermissionsRequest]);

  const startCamera = async () => {
    try {
      console.log("Verificando permisos de cámara y micrófono para video...");
      
      // Solicitamos permisos con nuestro nuevo sistema
      const permissionResult = await requestMediaPermissions('both', setShowPermissionsRequest);
      
      if (permissionResult && videoRef.current) {
        console.log("Permisos concedidos para video, configurando stream...");
        
        // Solicitamos permisos explícitamente
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' },
          audio: true
        });
        
        videoRef.current.srcObject = stream;
        mediaStreamRef.current = stream;
        
        // Asegurarse de que el video se reproduce
        try {
          await videoRef.current.play();
          console.log("Reproducción de vista previa iniciada con éxito");
          
          // Start recording automatically after preview is working
          startRecording(stream);
        } catch (playError) {
          console.error("Error al reproducir la vista previa:", playError);
          setError("No se pudo iniciar la cámara. Por favor, intenta de nuevo.");
        }
      }
    } catch (error) {
      console.error('Error al acceder a la cámara y micrófono:', error);
      setError("No se pudo acceder a la cámara o micrófono. Por favor, verifica los permisos.");
    }
  };

  const startRecording = (stream: MediaStream) => {
    try {
      console.log("Iniciando grabación de video...");
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      
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
      console.error("Error al iniciar la grabación de video:", error);
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
          console.log("Video grabado correctamente, tamaño:", videoBlob.size);
          
          // Stop the video stream
          stopMediaStream(mediaStreamRef.current);
          
          // Clean up interval
          if (recordingInterval) {
            clearInterval(recordingInterval);
          }
          
          // Send the video
          onCaptureVideo(videoUrl, recordingTime);
        };
      } catch (error) {
        console.error("Error al detener la grabación de video:", error);
        setError("Error al finalizar la grabación de video. Intenta de nuevo.");
      }
    } else {
      console.error("No se pudo detener la grabación de video - referencias no disponibles");
      setError("No se pudo completar la grabación de video. Intenta de nuevo.");
    }
  };

  const handlePermissionResponse = (granted: boolean) => {
    setShowPermissionsRequest(false);
    if (!granted) {
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
              {isRecording && !error && (
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
