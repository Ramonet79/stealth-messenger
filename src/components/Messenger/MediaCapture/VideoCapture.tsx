import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { AlertWithClose } from '@/components/ui/alert-with-close';
import PermissionsRequest from '@/components/PermissionsRequest';
import { requestMediaPermissions } from '../utils/mediaUtils';
import { captureVideo } from '@/composables'; 
import { isNativePlatform } from '@/services/PermissionsHandlerNative';

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
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let timerId: NodeJS.Timeout;

    if (recording && recordingStartTime) {
      timerId = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - recordingStartTime) / 1000;
        if (elapsed >= 10) {
          stopRecording();
        }
      }, 100);
    }

    return () => clearInterval(timerId);
  }, [recording, recordingStartTime]);

  useEffect(() => {
    const setupMedia = async () => {
      const hasPermissions = await requestMediaPermissions('both', setShowPermissionsDialog);
      if (hasPermissions) {
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: true,
          });
          setStream(newStream);

          const newMediaRecorder = new MediaRecorder(newStream, {
            mimeType: 'video/webm;codecs=vp8,opus',
          });
          setMediaRecorder(newMediaRecorder);

          if (videoRef.current) {
            videoRef.current.srcObject = newStream;
          }
        } catch (e) {
          console.error('Error al acceder a la cámara:', e);
          setError('Error al acceder a la cámara: ' + (e instanceof Error ? e.message : 'Error desconocido'));
        }
      }
    };

    if (!isNativePlatform()) {
      setupMedia();
    }

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
      setStream(null);
    };
  }, [setShowPermissionsDialog]);

  const stopRecording = () => {
    if (isNativePlatform()) {
      return;
    }

    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      stream?.getTracks().forEach((track) => track.stop());
      setRecording(false);
    }
  };

  const handleDataAvailable = ({ data }: BlobEvent) => {
    const videoUrl = URL.createObjectURL(data);
    setRecordedVideo(videoUrl);
    const durationInSeconds = 10;
    onCaptureVideo(videoUrl, durationInSeconds);
  };

  const handleRecord = async () => {
    try {
      setRecording(true);
      setRecordingStartTime(Date.now());
      
      if (isNativePlatform()) {
        const videoBlob = await captureVideo();
        if (videoBlob) {
          const videoUrl = URL.createObjectURL(videoBlob);
          const durationInSeconds = 10;
          onCaptureVideo(videoUrl, durationInSeconds);
        } else {
          setError('No se pudo grabar el video.');
        }
        setRecording(false);
      } else {
        if (!stream || !mediaRecorder) {
          setError('Cámara no inicializada correctamente.');
          setRecording(false);
          return;
        }

        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start();
      }
    } catch (e) {
      console.error('Error al grabar video:', e);
      setError('Error al grabar video: ' + (e instanceof Error ? e.message : 'Error desconocido'));
      setRecording(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {showPermissionsDialog && (
        <PermissionsRequest
          onRequestComplete={(granted) => {
            setShowPermissionsDialog(false);
            if (!granted) {
              setError('Se requieren permisos de cámara y micrófono para grabar video.');
            }
          }}
          permissionType="both"
        />
      )}
      <div className="bg-black p-3 flex justify-between items-center">
        <div className="text-white">Video</div>
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
          </>
        )}
      </div>
      <div className="bg-black p-4 flex justify-center">
        <button
          onClick={handleRecord}
          className={`w-16 h-16 rounded-full ${
            recording ? 'bg-red-500 animate-pulse' : 'bg-white'
          } flex items-center justify-center`}
        >
          <div className={`w-14 h-14 rounded-full border-4 ${recording ? 'border-red-700' : 'border-black'}`}></div>
        </button>
      </div>
    </div>
  );
};

export default VideoCapture;
