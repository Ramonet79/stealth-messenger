
import React, { useState, useRef } from 'react';
import { SendHorizontal, Mic, Camera, Video, Smile, X } from 'lucide-react';
import EmojiKeyboard from './EmojiKeyboard';
import { MediaCaptureMode } from './types';

interface ConversationInputProps {
  onSendMessage: (text: string, type?: 'text' | 'image' | 'audio' | 'video', mediaUrl?: string) => void;
}

const ConversationInput: React.FC<ConversationInputProps> = ({ onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  const [showEmojiKeyboard, setShowEmojiKeyboard] = useState(false);
  const [captureMode, setCaptureMode] = useState<MediaCaptureMode>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoChunksRef = useRef<Blob[]>([]);

  // Format recording time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle sending text message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  // Iniciar captura de imagen
  const startImageCapture = async () => {
    try {
      if (videoRef.current && canvasRef.current) {
        setCaptureMode('image');
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        videoRef.current.srcObject = stream;
        mediaStreamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accediendo a la cámara:', error);
      setCaptureMode(null);
    }
  };

  // Capturar imagen
  const captureImage = () => {
    if (videoRef.current && canvasRef.current && mediaStreamRef.current) {
      const context = canvasRef.current.getContext('2d');
      
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        const imageUrl = canvasRef.current.toDataURL('image/jpeg');
        
        // Detener la transmisión de video
        const tracks = mediaStreamRef.current.getTracks();
        tracks.forEach(track => track.stop());
        
        // Enviar la imagen
        onSendMessage("📷 Imagen", 'image', imageUrl);
        
        // Limpiar
        setCaptureMode(null);
        mediaStreamRef.current = null;
      }
    }
  };

  // Iniciar grabación de audio
  const startAudioRecording = async () => {
    try {
      setCaptureMode('audio');
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
      console.error('Error accediendo al micrófono:', error);
      setCaptureMode(null);
      setIsRecording(false);
    }
  };

  // Detener grabación de audio
  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaStreamRef.current) {
      mediaRecorderRef.current.stop();
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Detener la transmisión de audio
        const tracks = mediaStreamRef.current!.getTracks();
        tracks.forEach(track => track.stop());
        
        // Enviar el audio
        onSendMessage(`Mensaje de audio (${formatTime(recordingTime)})`, 'audio', audioUrl);
        
        // Limpiar
        if (recordingInterval) {
          clearInterval(recordingInterval);
        }
        
        setIsRecording(false);
        setCaptureMode(null);
        setRecordingTime(0);
        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;
      };
    }
  };

  // Iniciar grabación de video
  const startVideoRecording = async () => {
    try {
      if (videoRef.current) {
        setCaptureMode('video');
        setIsRecording(true);
        setRecordingTime(0);
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' },
          audio: true
        });
        
        videoRef.current.srcObject = stream;
        mediaStreamRef.current = stream;
        
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
      }
    } catch (error) {
      console.error('Error accediendo a la cámara y micrófono:', error);
      setCaptureMode(null);
      setIsRecording(false);
    }
  };

  // Detener grabación de video
  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && mediaStreamRef.current) {
      mediaRecorderRef.current.stop();
      
      mediaRecorderRef.current.onstop = () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        
        // Detener la transmisión de video
        const tracks = mediaStreamRef.current!.getTracks();
        tracks.forEach(track => track.stop());
        
        // Enviar el video
        onSendMessage(`🎥 Video (${formatTime(recordingTime)})`, 'video', videoUrl);
        
        // Limpiar
        if (recordingInterval) {
          clearInterval(recordingInterval);
        }
        
        setIsRecording(false);
        setCaptureMode(null);
        setRecordingTime(0);
        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;
      };
    }
  };

  // Cancelar cualquier captura
  const cancelCapture = () => {
    if (mediaStreamRef.current) {
      const tracks = mediaStreamRef.current.getTracks();
      tracks.forEach(track => track.stop());
    }
    
    if (recordingInterval) {
      clearInterval(recordingInterval);
    }
    
    setIsRecording(false);
    setCaptureMode(null);
    setRecordingTime(0);
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
  };

  // Handle emoji selection
  const handleSelectEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiKeyboard(false);
  };

  return (
    <div>
      {captureMode && (
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
              onClick={cancelCapture}
              className="p-2 rounded-full bg-gray-800 text-white"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center">
            {captureMode === 'image' || captureMode === 'video' ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                muted
              />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                  <Mic size={48} className="text-white" />
                </div>
                <p className="text-white text-xl">Grabando audio...</p>
              </div>
            )}
            
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          <div className="bg-black p-4 flex justify-center">
            {captureMode === 'image' ? (
              <button
                onClick={captureImage}
                className="w-16 h-16 rounded-full bg-white flex items-center justify-center"
              >
                <div className="w-14 h-14 rounded-full border-4 border-black"></div>
              </button>
            ) : captureMode === 'audio' ? (
              isRecording ? (
                <button
                  onClick={stopAudioRecording}
                  className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center"
                >
                  <div className="w-8 h-8 rounded bg-white"></div>
                </button>
              ) : null
            ) : captureMode === 'video' ? (
              isRecording ? (
                <button
                  onClick={stopVideoRecording}
                  className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center"
                >
                  <div className="w-8 h-8 rounded bg-white"></div>
                </button>
              ) : (
                <button
                  onClick={() => mediaRecorderRef.current?.start()}
                  className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center"
                >
                  <div className="w-8 h-8 rounded-full bg-white"></div>
                </button>
              )
            ) : null}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t flex items-center">
        <button
          type="button"
          onClick={startImageCapture}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 mr-1"
        >
          <Camera size={22} />
        </button>
        
        <button
          type="button"
          onClick={startVideoRecording}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 mr-1"
        >
          <Video size={22} />
        </button>
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="w-full py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-messenger-primary focus:border-transparent"
          />
        </div>
        
        <button
          type="button" 
          onClick={() => setShowEmojiKeyboard(!showEmojiKeyboard)}
          className="ml-2 p-2 rounded-full text-gray-500 hover:bg-gray-100"
        >
          <Smile size={22} />
        </button>
        
        {newMessage.trim() ? (
          <button
            type="submit"
            className="ml-2 p-2 bg-messenger-primary text-white rounded-full hover:bg-messenger-secondary transition-colors"
          >
            <SendHorizontal size={22} />
          </button>
        ) : (
          <button
            type="button"
            onClick={startAudioRecording}
            className="ml-2 p-2 bg-messenger-primary text-white rounded-full hover:bg-messenger-secondary transition-colors"
          >
            <Mic size={22} />
          </button>
        )}
        
        {showEmojiKeyboard && (
          <EmojiKeyboard 
            onSelectEmoji={handleSelectEmoji} 
            onClose={() => setShowEmojiKeyboard(false)} 
          />
        )}
      </form>
    </div>
  );
};

export default ConversationInput;
