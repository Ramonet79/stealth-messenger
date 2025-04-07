
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { formatTime, stopMediaStream } from '../utils/mediaUtils';

interface VideoCaptureProps {
  onCaptureVideo: (videoUrl: string, duration: number) => void;
  onCancel: () => void;
}

const VideoCapture: React.FC<VideoCaptureProps> = ({ onCaptureVideo, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Initialize camera when component mounts
    const startCamera = async () => {
      try {
        if (videoRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' },
            audio: true
          });
          
          videoRef.current.srcObject = stream;
          mediaStreamRef.current = stream;
          
          // Start recording automatically
          startRecording(stream);
        }
      } catch (error) {
        console.error('Error accessing camera and microphone:', error);
        onCancel();
      }
    };

    startCamera();

    // Cleanup when component unmounts
    return () => {
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
      stopMediaStream(mediaStreamRef.current);
      mediaStreamRef.current = null;
      mediaRecorderRef.current = null;
    };
  }, [onCancel]);

  const startRecording = (stream: MediaStream) => {
    setIsRecording(true);
    setRecordingTime(0);
    
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    
    videoChunksRef.current = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        videoChunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.start();
    
    const interval = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    setRecordingInterval(interval);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaStreamRef.current) {
      mediaRecorderRef.current.stop();
      
      mediaRecorderRef.current.onstop = () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        
        // Stop the video stream
        stopMediaStream(mediaStreamRef.current);
        
        // Clean up interval
        if (recordingInterval) {
          clearInterval(recordingInterval);
        }
        
        // Send the video
        onCaptureVideo(videoUrl, recordingTime);
      };
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
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
      
      <div className="flex-1 relative flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          muted
        />
      </div>
      
      <div className="bg-black p-4 flex justify-center">
        {isRecording && (
          <button
            onClick={stopRecording}
            className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center"
          >
            <div className="w-8 h-8 rounded bg-white"></div>
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoCapture;
