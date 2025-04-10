
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { isNativePlatform } from '@/services/PermissionsHandlerNative';

// Web implementation for audio recording
export async function recordAudio(): Promise<File | null> {
  try {
    if (isNativePlatform()) {
      // For native platforms, we'll use a different approach
      console.log('Using native audio recording');
      const audio = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
        promptLabelHeader: 'Audio',
        promptLabelCancel: 'Cancelar',
        promptLabelPhoto: 'Seleccionar Audio',
        promptLabelPicture: 'Grabar Audio'
      });
      
      if (audio && audio.webPath) {
        const response = await fetch(audio.webPath);
        const blob = await response.blob();
        return new File([blob], `audio_${Date.now()}.m4a`, { type: 'audio/m4a' });
      }
      return null;
    }
    
    // Web implementation - use MediaRecorder
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return new Promise((resolve) => {
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];
      
      mediaRecorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
      });
      
      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        resolve(audioFile);
      });
      
      // Start recording with 10s timeout
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 10000);
    });
  } catch (err) {
    console.error('Error recording audio:', err);
    return null;
  }
}

// Function to capture photo
export async function capturePhoto(): Promise<File | null> {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });
    
    if (image && image.webPath) {
      const response = await fetch(image.webPath);
      const blob = await response.blob();
      return new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
    }
    return null;
  } catch (err) {
    console.error('Error capturing photo:', err);
    return null;
  }
}

// Function to record video
export async function recordVideo(): Promise<File | null> {
  try {
    if (isNativePlatform()) {
      // For native platforms, use Camera API with video configuration
      console.log('Using native video recording');
      const video = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        promptLabelHeader: 'Video',
        promptLabelCancel: 'Cancelar',
        promptLabelPhoto: 'Biblioteca',
        promptLabelPicture: 'Grabar Video'
      });
      
      if (video && video.webPath) {
        const response = await fetch(video.webPath);
        const blob = await response.blob();
        return new File([blob], `video_${Date.now()}.mp4`, { type: 'video/mp4' });
      }
      return null;
    }
    
    // Web implementation - use MediaRecorder for video
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' },
      audio: true 
    });
    
    return new Promise((resolve) => {
      const mediaRecorder = new MediaRecorder(stream);
      const videoChunks: Blob[] = [];
      
      mediaRecorder.addEventListener('dataavailable', (event) => {
        videoChunks.push(event.data);
      });
      
      mediaRecorder.addEventListener('stop', () => {
        const videoBlob = new Blob(videoChunks, { type: 'video/webm' });
        const videoFile = new File([videoBlob], `video_${Date.now()}.webm`, { type: 'video/webm' });
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        resolve(videoFile);
      });
      
      // Start recording with 10s timeout
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 10000);
    });
  } catch (err) {
    console.error('Error recording video:', err);
    return null;
  }
}
