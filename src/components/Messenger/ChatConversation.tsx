
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Camera, Mic, X } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sent: boolean;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'audio';
  mediaUrl?: string;
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
  onBack,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<number | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
    };
  }, [recordingInterval]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate image preview
      const imageUrl = URL.createObjectURL(file);
      setImagePreviewUrl(imageUrl);
      setShowImagePreview(true);
    }
  };

  const handleSendImage = () => {
    // Simulate sending an image
    onSendMessage('Imagen enviada', 'image', imagePreviewUrl);
    setShowImagePreview(false);
    setImagePreviewUrl('');
  };

  const handleCancelImage = () => {
    setShowImagePreview(false);
    setImagePreviewUrl('');
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    // Start timer
    const interval = window.setInterval(() => {
      setRecordingTime((prevTime) => prevTime + 1);
    }, 1000);
    
    setRecordingInterval(interval);
  };

  const handleStopRecording = () => {
    if (recordingInterval) {
      clearInterval(recordingInterval);
    }
    
    setIsRecording(false);
    setRecordingInterval(null);
    
    // Simulate sending audio
    onSendMessage(`Audio de ${formatRecordingTime(recordingTime)}`, 'audio');
    setRecordingTime(0);
  };

  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMessageStatus = (status?: string) => {
    switch (status) {
      case 'sent':
        return <span className="text-xs text-gray-400 ml-1">✓</span>;
      case 'delivered':
        return <span className="text-xs text-gray-400 ml-1">✓✓</span>;
      case 'read':
        return <span className="text-xs text-blue-400 ml-1">✓✓</span>;
      default:
        return null;
    }
  };

  const renderMessage = (message: Message) => {
    if (message.type === 'image') {
      return (
        <div className="relative overflow-hidden rounded-lg">
          <div className="bg-gray-200 h-40 flex items-center justify-center">
            {message.mediaUrl ? (
              <img 
                src={message.mediaUrl} 
                alt="Imagen enviada" 
                className="h-full w-full object-cover"
              />
            ) : (
              <span>📷 Imagen</span>
            )}
          </div>
          {message.text !== 'Imagen enviada' && (
            <p className="mt-1">{message.text}</p>
          )}
        </div>
      );
    }
    
    if (message.type === 'audio') {
      return (
        <div className="flex items-center space-x-2 bg-gray-100 rounded-full py-2 px-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <Mic size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="h-1 bg-gray-300 rounded-full w-full">
              <div className="h-1 bg-blue-500 rounded-full w-1/3"></div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {message.text.split('Audio de ')[1] || '0:00'}
          </div>
        </div>
      );
    }
    
    return message.text;
  };

  return (
    <div className="flex flex-col h-full bg-messenger-background">
      <div className="flex items-center p-4 border-b bg-white">
        <button
          onClick={onBack}
          className="mr-3 p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="font-medium">{contactName}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No hay mensajes</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="mb-4">
              <div 
                className={`message-bubble ${message.sent ? 'sent' : 'received'} 
                  ${message.sent 
                    ? 'bg-messenger-primary text-white ml-auto' 
                    : 'bg-white border border-gray-200'} 
                  rounded-lg p-3 max-w-[80%] relative shadow-sm`}
              >
                {renderMessage(message)}
                <div className={`text-xs ${message.sent ? 'text-white/70' : 'text-gray-500'} text-right mt-1 flex items-center justify-end`}>
                  <span>{message.timestamp}</span>
                  {message.sent && renderMessageStatus(message.status)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {showImagePreview && (
        <div className="p-3 bg-gray-100 border-t">
          <div className="flex items-center">
            <div className="relative w-20 h-20 bg-gray-200 rounded-lg overflow-hidden mr-3">
              <img 
                src={imagePreviewUrl} 
                alt="Vista previa" 
                className="h-full w-full object-cover" 
              />
              <button 
                onClick={handleCancelImage}
                className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Añadir comentario..."
                className="w-full px-3 py-2 rounded-lg border"
              />
            </div>
            <button
              onClick={handleSendImage}
              className="ml-2 p-2 bg-messenger-primary text-white rounded-full"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {isRecording && (
        <div className="p-3 bg-gray-100 border-t">
          <div className="flex items-center">
            <div className="animate-pulse mr-3">
              <Mic size={24} className="text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-red-500">Grabando audio: {formatRecordingTime(recordingTime)}</p>
              <div className="h-1 bg-gray-300 rounded-full w-full mt-1">
                <div className="h-1 bg-red-500 rounded-full animate-pulse" style={{width: `${Math.min((recordingTime / 120) * 100, 100)}%`}}></div>
              </div>
            </div>
            <button
              onClick={handleStopRecording}
              className="ml-2 p-2 bg-red-500 text-white rounded-full"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {!showImagePreview && !isRecording && (
        <div className="p-3 border-t bg-white">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-transparent outline-none"
            />
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            
            <button
              onClick={handleImageClick}
              className="ml-2 p-1 rounded-full text-gray-500 hover:text-messenger-primary"
            >
              <Camera size={20} />
            </button>
            
            <button
              onMouseDown={handleStartRecording}
              onMouseUp={handleStopRecording}
              onTouchStart={handleStartRecording}
              onTouchEnd={handleStopRecording}
              className="ml-2 p-1 rounded-full text-gray-500 hover:text-messenger-primary"
            >
              <Mic size={20} />
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`ml-2 p-1 rounded-full ${
                newMessage.trim() ? 'bg-messenger-primary text-white' : 'bg-gray-300 text-gray-500'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatConversation;
