
import React, { useState, useRef } from 'react';
import { SendHorizontal, Paperclip, Mic, Image as ImageIcon, Video, Smile } from 'lucide-react';
import EmojiKeyboard from './EmojiKeyboard';

interface ConversationInputProps {
  onSendMessage: (text: string, type?: 'text' | 'image' | 'audio' | 'video', mediaUrl?: string) => void;
}

const ConversationInput: React.FC<ConversationInputProps> = ({ onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  const [showEmojiKeyboard, setShowEmojiKeyboard] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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

  // Handle audio recording
  const handleRecordAudio = () => {
    // Start recording
    if (!isRecording) {
      setIsRecording(true);
      setRecordingTime(0);
      
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      setRecordingInterval(interval);
    } 
    // End recording
    else {
      setIsRecording(false);
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
      
      // Simulate sending audio with duration
      const audioDuration = recordingTime;
      onSendMessage(`Mensaje de audio (${formatTime(audioDuration)})`, 'audio');
      
      setRecordingTime(0);
    }
  };

  // Handle image upload
  const handleImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle video upload
  const handleVideoUpload = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  // Process selected image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // In a real app, we would upload the image to a server here
      // For this simulation, we create a temporary URL
      const imageUrl = URL.createObjectURL(files[0]);
      
      // Send message with image
      onSendMessage("📷 Imagen", 'image', imageUrl);
      
      // Clear input to allow selecting the same image again
      e.target.value = '';
    }
  };

  // Process selected video
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Create a temporary URL for the video
      const videoUrl = URL.createObjectURL(files[0]);
      
      // Send message with video
      onSendMessage("🎥 Video", 'video', videoUrl);
      
      // Clear input to allow selecting the same video again
      e.target.value = '';
    }
  };

  // Handle emoji selection
  const handleSelectEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiKeyboard(false);
  };

  return (
    <form onSubmit={handleSendMessage} className="p-3 bg-white border-t flex items-center">
      <input 
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      
      <input 
        type="file"
        ref={videoInputRef}
        accept="video/*"
        className="hidden"
        onChange={handleVideoChange}
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
        onClick={handleVideoUpload}
        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 mr-1"
      >
        <Video size={22} />
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
      
      {showEmojiKeyboard && (
        <EmojiKeyboard 
          onSelectEmoji={handleSelectEmoji} 
          onClose={() => setShowEmojiKeyboard(false)} 
        />
      )}
    </form>
  );
};

export default ConversationInput;
