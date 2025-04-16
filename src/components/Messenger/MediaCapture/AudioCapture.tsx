
import React, { useState, useEffect } from 'react';
import { X, Mic } from 'lucide-react';
import { AlertWithClose } from '@/components/ui/alert-with-close';
import PermissionsRequest from '@/components/PermissionsRequest';
import { requestMediaPermissions } from '../utils/mediaUtils';
import { startAudioRecording, stopAudioRecording } from '@/composables'; 
import { isNativePlatform } from '@/services/PermissionsHandlerNative';
import { useToast } from '@/hooks/use-toast';

interface AudioCaptureProps {
  onCaptureAudio: (audioUrl: string, duration: number) => void;
  onCancel: () => void;
}

const AudioCapture: React.FC<AudioCaptureProps> = ({ onCaptureAudio, onCancel }) => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let intervalId: number | null = null;

    if (recording && recordingStartTime) {
      intervalId = setInterval(() => {
        const now = Date.now();
        const timeDiff = now - recordingStartTime;
        setElapsedTime(Math.floor(timeDiff / 1000));
      }, 1000) as any;
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [recording, recordingStartTime]);

  useEffect(() => {
    const checkPermissions = async () => {
      console.log('Verificando permisos de audio...');
      const hasMediaPermissions = await requestMediaPermissions('microphone', setShowPermissionsDialog);
      console.log('Permisos de audio:', hasMediaPermissions);
      setHasPermissions(hasMediaPermissions);
    };

    checkPermissions();
  }, []);

  const handleRecord = async () => {
    try {
      console.log('⏺️ Iniciando grabación de audio...');
      toast({
        title: "Grabación iniciada",
        description: "Grabando audio...",
      });
      
      setRecording(true);
      setRecordingStartTime(Date.now());
      
      if (isNativePlatform()) {
        // Para plataformas nativas, usamos las nuevas funciones
        console.log('Usando API nativa para grabación de audio');
        
        try {
          await startAudioRecording();
          console.log('Grabación de audio iniciada correctamente');
          
          // Establecemos un temporizador para detener la grabación después de un tiempo
          setTimeout(async () => {
            try {
              console.log('Deteniendo grabación después de timeout');
              const audioBlob = await stopAudioRecording();
              if (audioBlob) {
                console.log('Audio grabado con éxito:', audioBlob);
                const audioUrl = URL.createObjectURL(audioBlob);
                const durationInSeconds = elapsedTime > 0 ? elapsedTime : 10;
                onCaptureAudio(audioUrl, durationInSeconds);
                toast({
                  title: "Grabación completada",
                  description: `Audio grabado (${durationInSeconds}s)`,
                });
              } else {
                console.error('No se pudo grabar el audio.');
                setError('No se pudo grabar el audio.');
                toast({
                  title: "Error",
                  description: "No se pudo grabar el audio",
                  variant: "destructive"
                });
              }
            } catch (err) {
              console.error('Error al detener grabación:', err);
              setError(`Error al detener grabación: ${err.message || 'Error desconocido'}`);
            } finally {
              setRecording(false);
            }
          }, 5000); // 5 segundos de grabación
        } catch (err) {
          console.error('Error al iniciar grabación nativa:', err);
          setError(`Error al iniciar grabación: ${err.message || 'Error desconocido'}`);
          setRecording(false);
        }
      } else {
        // Para web, continuamos con la implementación existente
        console.log('Usando Web Audio API para grabación');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);

        const audioChunks: Blob[] = [];
        recorder.ondataavailable = event => {
          console.log('Datos de audio disponibles:', event.data.size);
          audioChunks.push(event.data);
        };

        recorder.onstop = () => {
          console.log('Grabación detenida, procesando audio...');
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          setRecording(false);
          const durationInSeconds = elapsedTime;
          console.log(`Audio grabado: duración ${durationInSeconds}s, tamaño ${audioBlob.size} bytes`);
          onCaptureAudio(url, durationInSeconds);
          stream.getTracks().forEach(track => track.stop());
          toast({
            title: "Grabación completada",
            description: `Audio grabado (${durationInSeconds}s)`,
          });
        };

        console.log('Iniciando grabación web...');
        recorder.start();
      }
    } catch (e) {
      console.error('Error al grabar audio:', e);
      setError('Error al grabar audio: ' + (e instanceof Error ? e.message : 'Error desconocido'));
      setRecording(false);
      toast({
        title: "Error",
        description: "Error al grabar audio",
        variant: "destructive"
      });
    }
  };

  const handleStop = () => {
    console.log('Deteniendo grabación manualmente...');
    if (mediaRecorder) {
      mediaRecorder.stop();
    } else if (isNativePlatform()) {
      // Detener grabación nativa
      stopAudioRecording().then(audioBlob => {
        if (audioBlob) {
          console.log('Audio grabado con éxito:', audioBlob);
          const audioUrl = URL.createObjectURL(audioBlob);
          const durationInSeconds = elapsedTime > 0 ? elapsedTime : 1;
          onCaptureAudio(audioUrl, durationInSeconds);
        }
      }).catch(error => {
        console.error('Error al detener grabación:', error);
      }).finally(() => {
        setRecording(false);
      });
    }
    setRecording(false);
  };

  const handlePermissionResponse = (granted: boolean) => {
    console.log('Respuesta de permisos:', granted);
    setShowPermissionsDialog(false);
    setHasPermissions(granted);
    
    if (granted) {
      toast({
        title: "Permisos concedidos",
        description: "Ahora puedes grabar audio",
      });
    } else {
      toast({
        title: "Permisos denegados",
        description: "No se pueden grabar audios sin permisos",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {showPermissionsDialog ? (
        <PermissionsRequest
          onRequestComplete={handlePermissionResponse}
          permissionType="microphone"
        />
      ) : (
        <>
          <div className="bg-black p-3 flex justify-between items-center">
            <div className="text-white">Grabación de Audio</div>
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
              <div className="text-white text-center">
                {recording ? (
                  <>
                    <div className="animate-pulse text-red-500 text-6xl mb-4">●</div>
                    <p className="text-lg mb-2">Grabando... {elapsedTime}s</p>
                    <div className="animate-pulse bg-red-600/20 rounded-full p-6 mt-4">
                      <Mic size={48} className="text-red-500" />
                    </div>
                    <button
                      onClick={handleStop}
                      className="mt-6 px-6 py-3 bg-red-600 text-white rounded-full font-medium"
                    >
                      Detener
                    </button>
                  </>
                ) : (
                  <>
                    <p className="mb-4">Presiona el botón para comenzar a grabar audio</p>
                    <button
                      onClick={handleRecord}
                      className="mt-4 px-8 py-8 bg-blue-600 text-white rounded-full flex items-center justify-center"
                      disabled={!hasPermissions}
                    >
                      <Mic size={48} />
                    </button>
                    <p className="mt-4 text-sm text-gray-400">
                      {hasPermissions 
                        ? "Listo para grabar" 
                        : "Esperando permisos de micrófono..."}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AudioCapture;
