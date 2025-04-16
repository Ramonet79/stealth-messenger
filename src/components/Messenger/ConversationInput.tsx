
import React, { useState } from 'react';
import { SendHorizontal, Mic, Camera, Video, Smile } from 'lucide-react';
import EmojiKeyboard from './EmojiKeyboard';
import { MediaCaptureMode } from './types';
import ImageCapture from './MediaCapture/ImageCapture';
import AudioCapture from './MediaCapture/AudioCapture';
import VideoCapture from './MediaCapture/VideoCapture';
import { formatTime } from './utils/mediaUtils';
import useMediaCapture from '@/hooks/useMediaCapture';
import { useToast } from '@/hooks/use-toast';
import { isNativePlatform } from '@/services/PermissionsHandlerNative';

interface ConversationInputProps {
  onSendMessage: (text: string, type?: 'text' | 'image' | 'audio' | 'video', mediaUrl?: string) => void;
}

const ConversationInput: React.FC<ConversationInputProps> = ({ onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiKeyboard, setShowEmojiKeyboard] = useState(false);
  const [captureMode, setCaptureMode] = useState<MediaCaptureMode>(null);
  const { startCapture } = useMediaCapture();
  const { toast } = useToast();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      console.log('Enviando mensaje de texto:', newMessage);
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleCaptureImage = (imageUrl: string) => {
    console.log('Imagen capturada:', imageUrl);
    onSendMessage("📷 Image", 'image', imageUrl);
    setCaptureMode(null);
    toast({
      title: "Imagen enviada",
      description: "La imagen se ha adjuntado al mensaje",
    });
  };

  const handleCaptureAudio = (audioUrl: string, duration: number) => {
    console.log('Audio capturado:', audioUrl, 'duración:', duration);
    onSendMessage(`Audio message (${formatTime(duration)})`, 'audio', audioUrl);
    setCaptureMode(null);
    toast({
      title: "Audio enviado",
      description: `Audio de ${formatTime(duration)} adjuntado al mensaje`,
    });
  };

  const handleCaptureVideo = (videoUrl: string, duration: number) => {
    console.log('Video capturado:', videoUrl, 'duración:', duration);
    onSendMessage(`🎥 Video (${formatTime(duration)})`, 'video', videoUrl);
    setCaptureMode(null);
    toast({
      title: "Video enviado",
      description: `Video de ${formatTime(duration)} adjuntado al mensaje`,
    });
  };

  const handleSelectEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiKeyboard(false);
  };

  const handleCancelCapture = () => {
    console.log('Captura cancelada');
    setCaptureMode(null);
  };

  const handleMediaButton = async (type: MediaCaptureMode) => {
    console.log(`Botón de ${type} pulsado`);
    
    // Para plataformas nativas, intentamos usar directamente el startCapture
    if (isNativePlatform()) {
      try {
        console.log(`Iniciando captura directa de ${type}`);
        toast({
          title: "Iniciando captura",
          description: `Preparando captura de ${type}...`,
        });
        
        // Pasamos el tipo de medio a la función startCapture
        const result = await startCapture(type);
        console.log(`Resultado de captura de ${type}:`, result);
        
        if (result) {
          if (type === 'image' && result instanceof File) {
            const url = URL.createObjectURL(result);
            handleCaptureImage(url);
          } else if (type === 'video' && result instanceof File) {
            const url = URL.createObjectURL(result);
            handleCaptureVideo(url, 10); // Duración estimada
          } else if (type === 'audio' && result === true) {
            // La captura de audio se maneja de manera asíncrona
            console.log('Captura de audio iniciada, esperando finalización');
          } else {
            console.log('El resultado de la captura no es del tipo esperado');
            // Si no se pudo capturar directamente, mostramos la interfaz normal
            setCaptureMode(type);
          }
        } else {
          // Si no se pudo capturar directamente, mostramos la interfaz normal
          console.log('Fallback a interfaz de captura estándar');
          setCaptureMode(type);
        }
      } catch (error) {
        console.error(`Error en captura directa de ${type}:`, error);
        // Si hay error, mostramos la interfaz normal como fallback
        setCaptureMode(type);
      }
    } else {
      // En web simplemente mostramos la interfaz de captura
      console.log('Usando interfaz estándar para captura en web');
      setCaptureMode(type);
    }
  };

  return (
    <div>
      {captureMode === 'image' && (
        <ImageCapture 
          onCaptureImage={handleCaptureImage} 
          onCancel={handleCancelCapture} 
        />
      )}
      
      {captureMode === 'audio' && (
        <AudioCapture 
          onCaptureAudio={handleCaptureAudio} 
          onCancel={handleCancelCapture} 
        />
      )}
      
      {captureMode === 'video' && (
        <VideoCapture 
          onCaptureVideo={handleCaptureVideo} 
          onCancel={handleCancelCapture} 
        />
      )}
      
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t flex items-center">
        <button
          type="button"
          onClick={() => handleMediaButton('image')}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 mr-1"
          aria-label="Enviar imagen"
        >
          <Camera size={22} />
        </button>
        
        <button
          type="button"
          onClick={() => handleMediaButton('video')}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 mr-1"
          aria-label="Enviar video"
        >
          <Video size={22} />
        </button>
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-messenger-primary focus:border-transparent"
          />
        </div>
        
        <button
          type="button" 
          onClick={() => setShowEmojiKeyboard(!showEmojiKeyboard)}
          className="ml-2 p-2 rounded-full text-gray-500 hover:bg-gray-100"
          aria-label="Insertar emoji"
        >
          <Smile size={22} />
        </button>
        
        {newMessage.trim() ? (
          <button
            type="submit"
            className="ml-2 p-2 bg-messenger-primary text-white rounded-full hover:bg-messenger-secondary transition-colors"
            aria-label="Enviar mensaje"
          >
            <SendHorizontal size={22} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleMediaButton('audio')}
            className="ml-2 p-2 bg-messenger-primary text-white rounded-full hover:bg-messenger-secondary transition-colors"
            aria-label="Grabar audio"
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
