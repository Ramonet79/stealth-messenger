
import React from 'react';
import { Check } from 'lucide-react';
import { Message } from './types';

interface ConversationMessageProps {
  message: Message;
}

const ConversationMessage: React.FC<ConversationMessageProps> = ({ message }) => {
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

  // Format time for audio messages
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex mb-3 ${message.sent ? 'justify-end' : 'justify-start'}`}>
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
        
        {message.type === 'video' && message.mediaUrl && (
          <div className="mb-1">
            <video 
              src={message.mediaUrl} 
              controls
              className="rounded-md max-h-48 w-auto"
              onError={(e) => {
                console.error("Error loading video:", e);
              }}
            >
              Tu navegador no soporta videos.
            </video>
          </div>
        )}
        
        {message.type === 'audio' && (
          <div className="flex items-center mb-1 bg-black/5 rounded-full px-3 py-2">
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
  );
};

export default ConversationMessage;
