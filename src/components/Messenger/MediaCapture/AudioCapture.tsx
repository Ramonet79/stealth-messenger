
import React, { useState, useRef, useEffect } from 'react';
import { X, Mic } from 'lucide-react';
import { formatTime, stopMediaStream, requestMediaPermissions } from '../utils/mediaUtils';
import { AlertWithClose } from '@/components/ui/alert-with-close';
import PermissionsRequest from '@/components/PermissionsRequest';

interface AudioCaptureProps {
  onCaptureAudio: (audioUrl: string, duration: number) => void;
  onCancel: () => void;
}

const AudioCapture: React.FC<AudioCaptureProps> = ({ onCaptureAudio, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPermissionsRequest, setShowPermissionsRequest] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const initAudio = async () => {
      try {
        const hasPermission = await requestMediaPermissions('microphone', (show) => {
          console.log("Setting microphone permissions dialog visible:", show);
          setShowPermissionsRequest(show);
        });

        // Si ya tenemos permisos, iniciamos grabación directamente
        if (hasPermission) {
          startRecording();
        }
      } catch (err) {
        console.error('Error en verificación de permisos:', err);
        setError('Error al verificar permisos. Por favor, inténtalo de nuevo.');
      }
    };
    
    initAudio();
    
    // Limpieza
    return () => {
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
      stopMediaStream(mediaStreamRef.current);
      mediaStreamRef.current = null;
      mediaRecorderRef.current = null;
    };
  }, []);

  const startRecording = async () => {
    try {
      console.log("Iniciando grabación de audio...");
      
      // Obtenemos el stream de audio
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      // Creamos el MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Preparamos para recoger datos
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onerror = (event) => {
        console.error("Error en el MediaRecorder:", event);
        setError("Error al grabar audio. Por favor, intenta de nuevo.");
      };
      
      // Iniciamos grabación
      mediaRecorder.start();
      console.log("Grabación de audio iniciada");
      setIsRecording(true);
      setRecordingTime(0);
      
      // Contador de tiempo
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      setRecordingInterval(interval);
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      setError("No se pudo acceder al micrófono. Por favor, verifica los permisos.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaStreamRef.current) {
      console.log("Deteniendo grabación de audio...");
      
      try {
        mediaRecorderRef.current.stop();
        
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          console.log("Audio grabado, tamaño:", audioBlob.size);
          
          // Detenemos el stream
          stopMediaStream(mediaStreamRef.current);
          
          // Limpiamos intervalo
          if (recordingInterval) {
            clearInterval(recordingInterval);
          }
          
          // Enviamos audio
          onCaptureAudio(audioUrl, recordingTime);
        };
      } catch (error) {
        console.error("Error al detener la grabación:", error);
        setError("Error al finalizar la grabación. Intenta de nuevo.");
      }
    } else {
      console.error("No se pudo detener la grabación");
      setError("No se pudo completar la grabación. Intenta de nuevo.");
    }
  };

  // Manejador de respuesta de permisos
  const handlePermissionResponse = (granted: boolean) => {
    console.log("Respuesta de permisos de micrófono:", granted);
    setShowPermissionsRequest(false);
    
    if (granted) {
      console.log("Permisos de micrófono concedidos, iniciando grabación");
      startRecording();
    } else {
      setError("Para grabar audio, es necesario conceder los permisos de micrófono.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {showPermissionsRequest ? (
        <PermissionsRequest 
          onRequestComplete={handlePermissionResponse}
          permissionType="microphone" 
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
          
          <div className="flex-1 flex items-center justify-center">
            {error ? (
              <AlertWithClose onClose={onCancel} variant="destructive" className="m-4">
                {error}
              </AlertWithClose>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                  <Mic size={48} className={`${isRecording ? 'text-red-500' : 'text-white'}`} />
                </div>
                <p className="text-white text-xl">
                  {isRecording ? "Grabando audio..." : "Preparando grabación..."}
                </p>
              </div>
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

export default AudioCapture;
