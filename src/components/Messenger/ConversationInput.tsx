import React, { useState } from 'react';
import { SendHorizontal, Mic, Camera, Video, Smile } from 'lucide-react';
import EmojiKeyboard from './EmojiKeyboard';
import { MediaCaptureMode } from './types';
import ImageCapture from './MediaCapture/ImageCapture';
import AudioCapture from './MediaCapture/AudioCapture';
import VideoCapture from './MediaCapture/VideoCapture';
import { formatTime } from './utils/mediaUtils';

interface ConversationInputProps {
  onSendMessage: (text: string, type?: 'text' | 'image' | 'audio' | 'video', mediaUrl?: string) => void;
}

const ConversationInput: React.FC<ConversationInputProps> = ({ onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiKeyboard, setShowEmojiKeyboard] = useState(false);
  const [captureMode, setCaptureMode] = useState<MediaCaptureMode>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleCaptureImage = (imageUrl: string) => {
    onSendMessage("📷 Image", 'image', imageUrl);
    setCaptureMode(null);
  };

  const handleCaptureAudio = (audioUrl: string, duration: number) => {
    onSendMessage(`Audio message (${formatTime(duration)})`, 'audio', audioUrl);
    setCaptureMode(null);
  };

  const handleCaptureVideo = (videoUrl: string, duration: number) => {
    onSendMessage(`🎥 Video (${formatTime(duration)})`, 'video', videoUrl);
    setCaptureMode(null);
  };

  const handleSelectEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiKeyboard(false);
  };

  const handleCancelCapture = () => {
    setCaptureMode(null);
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
          onClick={() => setCaptureMode('image')}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 mr-1"
        >
          <Camera size={22} />
        </button>
        
        <button
          type="button"
          onClick={() => setCaptureMode('video')}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 mr-1"
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
            onClick={() => setCaptureMode('audio')}
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
