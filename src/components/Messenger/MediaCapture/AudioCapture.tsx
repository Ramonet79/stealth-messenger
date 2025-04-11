
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AlertWithClose } from '@/components/ui/alert-with-close';
import PermissionsRequest from '@/components/PermissionsRequest';
import { requestMediaPermissions } from '../utils/mediaUtils';
import { startAudioRecording, stopAudioRecording } from '@/composables'; 
import { isNativePlatform } from '@/services/PermissionsHandlerNative';

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
      const hasMediaPermissions = await requestMediaPermissions('microphone', setShowPermissionsDialog);
      setHasPermissions(hasMediaPermissions);
    };

    checkPermissions();
  }, []);

  const handleRecord = async () => {
    try {
      setRecording(true);
      setRecordingStartTime(Date.now());
      
      if (isNativePlatform()) {
        // Para plataformas nativas, usamos las nuevas funciones
        startAudioRecording();
        
        // Establecemos un temporizador para detener la grabación después de un tiempo
        setTimeout(async () => {
          const audioBlob = await stopAudioRecording();
          if (audioBlob) {
            const audioUrl = URL.createObjectURL(audioBlob);
            const durationInSeconds = 10; // Asumimos 10 segundos como predeterminado
            onCaptureAudio(audioUrl, durationInSeconds);
          } else {
            setError('No se pudo grabar el audio.');
            setRecording(false);
          }
        }, 5000); // 5 segundos de grabación
      } else {
        // Para web, continuamos con la implementación existente
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);

        const audioChunks: Blob[] = [];
        recorder.ondataavailable = event => {
          audioChunks.push(event.data);
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          setRecording(false);
          const durationInSeconds = elapsedTime;
          onCaptureAudio(url, durationInSeconds);
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
      }
    } catch (e) {
      console.error('Error al grabar audio:', e);
      setError('Error al grabar audio: ' + (e instanceof Error ? e.message : 'Error desconocido'));
      setRecording(false);
    }
  };

  const handleStop = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    setRecording(false);
  };

  const handlePermissionResponse = (granted: boolean) => {
    setShowPermissionsDialog(false);
    setHasPermissions(granted);
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
            <div className="text-white">Audio Capture</div>
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
                    <div className="animate-pulse text-red-500 text-6xl">●</div>
                    <p className="text-lg">Recording... {elapsedTime}s</p>
                    <button
                      onClick={handleStop}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
                    >
                      Stop
                    </button>
                  </>
                ) : (
                  <>
                    <p>Press the button to start recording audio.</p>
                    <button
                      onClick={handleRecord}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                      disabled={!hasPermissions}
                    >
                      {hasPermissions ? 'Record Audio' : 'Waiting for Permissions'}
                    </button>
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
