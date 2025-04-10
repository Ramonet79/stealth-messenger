
import { MediaCapture, MediaFile, CaptureError, CaptureAudioOptions, CaptureVideoOptions } from '@awesome-cordova-plugins/media-capture';
import { Capacitor } from '@capacitor/core';

// Función para convertir la ruta del archivo a URL
const filePathToUrl = (filePath: string): string => {
  if (filePath.startsWith('file://')) {
    return filePath;
  }
  return `file://${filePath}`;
};

// Función para convertir MediaFile a File
const mediaFileToFile = async (mediaFile: MediaFile): Promise<File | null> => {
  try {
    const filePath = mediaFile.fullPath || mediaFile.localURL;
    if (!filePath) {
      console.error('No se pudo obtener la ruta del archivo');
      return null;
    }

    const response = await fetch(filePathToUrl(filePath));
    if (!response.ok) {
      console.error('Error al obtener el archivo:', response.status);
      return null;
    }

    const blob = await response.blob();
    const fileName = mediaFile.name || `media_${Date.now()}.${mediaFile.type.split('/')[1] || 'mp4'}`;
    
    return new File([blob], fileName, { 
      type: mediaFile.type || (mediaFile.name?.endsWith('.mp4') ? 'video/mp4' : 'audio/mpeg') 
    });
  } catch (error) {
    console.error('Error al convertir MediaFile a File:', error);
    return null;
  }
};

// Función para grabar audio
export async function recordAudio(): Promise<File | null> {
  if (!Capacitor.isNativePlatform()) {
    console.warn('Esta función solo está disponible en plataformas nativas');
    return null;
  }

  try {
    const options: CaptureAudioOptions = {
      limit: 1,
      duration: 10 // 10 segundos máximo
    };

    const mediaFiles = await MediaCapture.captureAudio(options);
    
    if (mediaFiles && mediaFiles.length > 0) {
      console.log('Audio grabado:', mediaFiles[0]);
      return mediaFileToFile(mediaFiles[0]);
    }
    
    return null;
  } catch (error) {
    if (error.code !== CaptureError.CAPTURE_NO_MEDIA_FILES) {
      console.error('Error al grabar audio:', error);
    }
    return null;
  }
}

// Función para grabar video
export async function recordVideo(): Promise<File | null> {
  if (!Capacitor.isNativePlatform()) {
    console.warn('Esta función solo está disponible en plataformas nativas');
    return null;
  }

  try {
    const options: CaptureVideoOptions = {
      limit: 1,
      duration: 10, // 10 segundos máximo
      quality: 1 // Alta calidad
    };

    const mediaFiles = await MediaCapture.captureVideo(options);
    
    if (mediaFiles && mediaFiles.length > 0) {
      console.log('Video grabado:', mediaFiles[0]);
      return mediaFileToFile(mediaFiles[0]);
    }
    
    return null;
  } catch (error) {
    if (error.code !== CaptureError.CAPTURE_NO_MEDIA_FILES) {
      console.error('Error al grabar video:', error);
    }
    return null;
  }
}
