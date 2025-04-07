
import React, { useState, useRef, useEffect } from 'react';
import { X, Mic } from 'lucide-react';
import { formatTime, stopMediaStream } from '../utils/mediaUtils';

interface AudioCaptureProps {
  onCaptureAudio: (audioUrl: string, duration: number) => void;
  onCancel: () => void;
}

const AudioCapture: React.FC<AudioCaptureProps> = ({ onCaptureAudio, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Start recording when component mounts
    startRecording();
    
    // Cleanup when component unmounts
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
      setIsRecording(true);
      setRecordingTime(0);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start();
      
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      setRecordingInterval(interval);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      onCancel();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaStreamRef.current) {
      mediaRecorderRef.current.stop();
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Stop the audio stream
        stopMediaStream(mediaStreamRef.current);
        
        // Clean up interval
        if (recordingInterval) {
          clearInterval(recordingInterval);
        }
        
        // Send the audio
        onCaptureAudio(audioUrl, recordingTime);
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
      
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-4">
            <Mic size={48} className="text-white" />
          </div>
          <p className="text-white text-xl">Recording audio...</p>
        </div>
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

export default AudioCapture;
