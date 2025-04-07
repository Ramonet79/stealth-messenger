
import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { stopMediaStream } from '../utils/mediaUtils';

interface ImageCaptureProps {
  onCaptureImage: (imageUrl: string) => void;
  onCancel: () => void;
}

const ImageCapture: React.FC<ImageCaptureProps> = ({ onCaptureImage, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Initialize camera when component mounts
    const startCamera = async () => {
      try {
        if (videoRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          
          videoRef.current.srcObject = stream;
          mediaStreamRef.current = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        onCancel();
      }
    };

    startCamera();

    // Cleanup when component unmounts
    return () => {
      stopMediaStream(mediaStreamRef.current);
      mediaStreamRef.current = null;
    };
  }, [onCancel]);

  const handleCaptureImage = () => {
    if (videoRef.current && canvasRef.current && mediaStreamRef.current) {
      const context = canvasRef.current.getContext('2d');
      
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        const imageUrl = canvasRef.current.toDataURL('image/jpeg');
        
        // Stop the video stream
        stopMediaStream(mediaStreamRef.current);
        mediaStreamRef.current = null;
        
        // Send the image
        onCaptureImage(imageUrl);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="bg-black p-3 flex justify-between items-center">
        <div className="text-white">Camera</div>
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
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <div className="bg-black p-4 flex justify-center">
        <button
          onClick={handleCaptureImage}
          className="w-16 h-16 rounded-full bg-white flex items-center justify-center"
        >
          <div className="w-14 h-14 rounded-full border-4 border-black"></div>
        </button>
      </div>
    </div>
  );
};

export default ImageCapture;
