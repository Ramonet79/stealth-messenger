
import React, { useState, useEffect, useRef } from 'react';
import { X, Video } from 'lucide-react';
import { AlertWithClose } from '@/components/ui/alert-with-close';
import PermissionsRequest from '@/components/PermissionsRequest';
import { requestMediaPermissions } from '../utils/mediaUtils';
import { captureVideo } from '@/composables'; 
import { isNativePlatform } from '@/services/PermissionsHandlerNative';
import { useToast } from '@/hooks/use-toast';

interface VideoCaptureProps {
  onCaptureVideo: (videoUrl: string, duration: number) => void;
  onCancel: () => void;
}

const VideoCapture: React.FC<VideoCaptureProps> = ({ onCaptureVideo, onCancel }) => {
  const [recording, setRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Efecto para actualizar el tiempo transcurrido durante la grabación
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;

    if (recording && recordingStartTime) {
      timerId = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - recordingStartTime) / 1000);
        setElapsedTime(elapsed);
        
        if (elapsed >= 30) { // Limitar a 30 segundos
          if (timerId) clearInterval(timerId);
          stopRecording();
        }
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [recording, recordingStartTime]);

  // Efecto para configurar el stream de video
  useEffect(() => {
    const setupMedia = async () => {
      console.log('Configurando stream de video...');
      const hasPermissions = await requestMediaPermissions('both', setShowPermissionsDialog);
      console.log('¿Tiene permisos para video?', hasPermissions);
      
      if (hasPermissions && !isNativePlatform()) {
        try {
          console.log('Solicitando acceso a cámara y micrófono...');
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: true,
          });
          console.log('Stream obtenido correctamente');
          setStream(newStream);

          const newMediaRecorder = new MediaRecorder(newStream, {
            mimeType: 'video/webm;codecs=vp8,opus',
          });
          console.log('MediaRecorder creado con éxito');
          setMediaRecorder(newMediaRecorder);

          if (videoRef.current) {
            videoRef.current.srcObject = newStream;
            console.log('Video preview activado');
          }
        } catch (e) {
          console.error('Error al acceder a la cámara:', e);
          setError('Error al acceder a la cámara: ' + (e instanceof Error ? e.message : 'Error desconocido'));
          toast({
            title: "Error",
            description: "No se pudo acceder a la cámara",
            variant: "destructive"
          });
        }
      }
    };

    if (!isNativePlatform()) {
      setupMedia();
    } else {
      // En plataformas nativas no necesitamos configurar el MediaRecorder
      console.log('En plataforma nativa, omitiendo configuración de MediaRecorder web');
    }

    return () => {
      if (stream) {
        console.log('Limpiando stream de video...');
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    };
  }, [setShowPermissionsDialog]);

  const stopRecording = () => {
    console.log('Deteniendo grabación de video...');
    
    if (isNativePlatform()) {
      setRecording(false);
      return;
    }

    if (mediaRecorder && mediaRecorder.state === 'recording') {
      console.log('Deteniendo MediaRecorder web...');
      mediaRecorder.stop();
      
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      
      setRecording(false);
      toast({
        title: "Grabación completada",
        description: `Video grabado (${elapsedTime}s)`,
      });
    }
  };

  const handleDataAvailable = ({ data }: BlobEvent) => {
    console.log(`Datos de video disponibles: ${data.size} bytes`);
    const videoUrl = URL.createObjectURL(data);
    setRecordedVideo(videoUrl);
    const durationInSeconds = elapsedTime > 0 ? elapsedTime : 10;
    console.log(`Video grabado: duración ${durationInSeconds}s`);
    onCaptureVideo(videoUrl, durationInSeconds);
  };

  const handleRecord = async () => {
    try {
      console.log('🎥 Iniciando grabación de video...');
      toast({
        title: "Grabación iniciada",
        description: "Grabando video...",
      });
      
      setRecording(true);
      setRecordingStartTime(Date.now());
      
      if (isNativePlatform()) {
        console.log('Usando API nativa para captura de video');
        try {
          const videoBlob = await captureVideo();
          if (videoBlob) {
            console.log('Video capturado con éxito:', videoBlob);
            const videoUrl = URL.createObjectURL(videoBlob);
            const durationInSeconds = 10; // Valor por defecto para grabaciones nativas
            onCaptureVideo(videoUrl, durationInSeconds);
            toast({
              title: "Video capturado",
              description: `Video grabado correctamente`,
            });
          } else {
            console.error('No se pudo grabar el video.');
            setError('No se pudo grabar el video.');
            toast({
              title: "Error",
              description: "No se pudo grabar el video",
              variant: "destructive"
            });
          }
        } catch (err) {
          console.error('Error al grabar video nativo:', err);
          setError(`Error al grabar video: ${err.message || 'Error desconocido'}`);
          toast({
            title: "Error",
            description: "Error al grabar video",
            variant: "destructive"
          });
        }
        setRecording(false);
      } else {
        if (!stream || !mediaRecorder) {
          console.error('Cámara no inicializada correctamente.');
          setError('Cámara no inicializada correctamente.');
          setRecording(false);
          return;
        }

        console.log('Configurando manejador de datos para MediaRecorder web');
        mediaRecorder.ondataavailable = handleDataAvailable;
        
        console.log('Iniciando grabación web...');
        mediaRecorder.start();
      }
    } catch (e) {
      console.error('Error al grabar video:', e);
      setError('Error al grabar video: ' + (e instanceof Error ? e.message : 'Error desconocido'));
      setRecording(false);
      toast({
        title: "Error",
        description: "Error al grabar video",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {showPermissionsDialog && (
        <PermissionsRequest
          onRequestComplete={(granted) => {
            console.log('Respuesta de permisos para video:', granted);
            setShowPermissionsDialog(false);
            if (!granted) {
              setError('Se requieren permisos de cámara y micrófono para grabar video.');
              toast({
                title: "Permisos denegados",
                description: "No se pueden grabar videos sin permisos",
                variant: "destructive"
              });
            } else {
              toast({
                title: "Permisos concedidos",
                description: "Ahora puedes grabar video",
              });
            }
          }}
          permissionType="both"
        />
      )}
      
      <div className="bg-black p-3 flex justify-between items-center">
        <div className="text-white">Grabación de Video</div>
        <button onClick={onCancel} className="p-2 rounded-full bg-gray-800 text-white">
          <X size={24} />
        </button>
      </div>
      
      <div className="flex-1 relative flex items-center justify-center bg-black">
        {error ? (
          <AlertWithClose onClose={onCancel} variant="destructive" className="m-4">
            {error}
          </AlertWithClose>
        ) : (
          <>
            {stream && (
              <video
                ref={videoRef}
                className="max-w-full max-h-full"
                autoPlay
                muted
                style={{ transform: 'scaleX(-1)' }}
              />
            )}
            
            {!stream && !isNativePlatform() && (
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Iniciando cámara...</p>
              </div>
            )}
            
            {isNativePlatform() && !recording && (
              <div className="text-white text-center">
                <Video size={64} className="mx-auto mb-6 text-blue-500" />
                <p className="mb-4">Presiona el botón para grabar video</p>
              </div>
            )}
            
            {recording && (
              <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center">
                <div className="animate-pulse w-3 h-3 bg-white rounded-full mr-2"></div>
                <span>REC {elapsedTime}s</span>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="bg-black p-4 flex justify-center">
        {recording ? (
          <button
            onClick={stopRecording}
            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center animate-pulse"
          >
            <div className="w-8 h-8 bg-white rounded-sm"></div>
          </button>
        ) : (
          <button
            onClick={handleRecord}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center"
          >
            <div className="w-14 h-14 rounded-full border-4 border-black"></div>
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoCapture;
