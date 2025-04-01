
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, SendHorizontal, Paperclip, Mic, Check, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Message {
  id: string;
  text: string;
  sent: boolean;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'audio';
  mediaUrl?: string;
  duration?: number; // Para mensajes de audio
}

interface ChatConversationProps {
  contactName: string;
  messages: Message[];
  onSendMessage: (text: string, type?: 'text' | 'image' | 'audio', mediaUrl?: string) => void;
  onBack: () => void;
}

const ChatConversation: React.FC<ChatConversationProps> = ({
  contactName,
  messages,
  onSendMessage,
  onBack
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  
  // Función para renderizar indicadores de estado de mensaje
  const renderMessageStatus = (status?: string) => {
    if (!status) return null;
    
    switch (status) {
      case 'sent':
        return <Check size={14} className="text-gray-400" />;
      case 'delivered':
        return (
          <div className="flex">
            <Check size={14} className="text-gray-400" />
            <Check size={14} className="text-gray-400 -ml-1" />
          </div>
        );
      case 'read':
        return (
          <div className="flex">
            <Check size={14} className="text-blue-500" />
            <Check size={14} className="text-blue-500 -ml-1" />
          </div>
        );
      default:
        return null;
    }
  };
  
  // Desplazarse hacia abajo cuando llegan nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Función para manejar envío de mensaje
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };
  
  // Función para simular grabación de audio
  const handleRecordAudio = () => {
    // Comienza la grabación
    if (!isRecording) {
      setIsRecording(true);
      setRecordingTime(0);
      
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      setRecordingInterval(interval);
    } 
    // Finaliza la grabación
    else {
      setIsRecording(false);
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
      
      // Simular envío de audio con duración
      const audioDuration = recordingTime;
      onSendMessage(`Mensaje de audio (${formatTime(audioDuration)})`, 'audio');
      
      setRecordingTime(0);
    }
  };
  
  // Función para formatear tiempo de grabación
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Manejar subida de imágenes
  const handleImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Procesar imagen seleccionada
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // En una aplicación real, aquí subiríamos la imagen a un servidor
      // Para esta simulación, creamos una URL temporal
      const imageUrl = URL.createObjectURL(files[0]);
      
      // Enviar mensaje con imagen
      onSendMessage("📷 Imagen", 'image', imageUrl);
      
      // Limpiar input para permitir seleccionar la misma imagen nuevamente
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-messenger-background">
      {/* Header */}
      <div className="flex items-center p-4 border-b bg-white">
        <button
          onClick={onBack}
          className="mr-3 p-2 rounded-full hover:bg-gray-200 transition-colors"
          aria-label={t('back')}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="font-medium">{contactName}</h2>
        </div>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto bg-messenger-background">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex mb-3 ${message.sent ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                message.sent
                  ? 'bg-messenger-primary text-white rounded-tr-none'
                  : 'bg-white text-gray-800 rounded-tl-none'
              }`}
            >
              {/* Contenido del mensaje según su tipo */}
              {message.type === 'image' && message.mediaUrl && (
                <div className="mb-1">
                  <img 
                    src={message.mediaUrl} 
                    alt="Imagen compartida" 
                    className="rounded-md max-h-48 w-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'placeholder.svg';
                    }}
                  />
                </div>
              )}
              
              {message.type === 'audio' && (
                <div className="flex items-center mb-1 bg-black/5 rounded-full px-3 py-2">
                  <Mic size={18} className={message.sent ? 'text-white' : 'text-gray-600'} />
                  <div className="w-32 h-4 mx-2 bg-black/10 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-black/20 rounded-full"></div>
                  </div>
                  <span className="text-xs">{message.duration ? formatTime(message.duration) : '00:15'}</span>
                </div>
              )}
              
              {/* Texto del mensaje (puede estar solo o acompañar media) */}
              <div>{message.text}</div>
              
              {/* Hora y estado */}
              <div className="text-xs mt-1 flex items-center justify-end space-x-1">
                <span className={message.sent ? 'text-white/70' : 'text-gray-500'}>
                  {message.timestamp}
                </span>
                {message.sent && renderMessageStatus(message.status)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t flex items-center">
        <input 
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        
        <button
          type="button"
          onClick={handleImageUpload}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 mr-1"
        >
          <ImageIcon size={22} />
        </button>
        
        <button
          type="button"
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 mr-1"
        >
          <Paperclip size={22} />
        </button>
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            disabled={isRecording}
            className="w-full py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-messenger-primary focus:border-transparent"
          />
          {isRecording && (
            <div className="absolute inset-0 flex items-center justify-between bg-red-50 rounded-full px-4 border border-red-300">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-2"></div>
                <span className="text-red-500">Grabando</span>
              </div>
              <span className="text-red-500">{formatTime(recordingTime)}</span>
            </div>
          )}
        </div>
        
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
            onClick={handleRecordAudio}
            className={`ml-2 p-2 rounded-full transition-colors ${
              isRecording 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-messenger-primary text-white hover:bg-messenger-secondary'
            }`}
          >
            <Mic size={22} />
          </button>
        )}
      </form>
    </div>
  );
};

export default ChatConversation;
