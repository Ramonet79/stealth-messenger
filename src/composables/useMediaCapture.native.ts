
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Media, MediaObject } from '@awesome-cordova-plugins/media';
import { Capacitor } from '@capacitor/core';
import { requestMediaPermissions } from './usePermissions';

// Define the extended Navigator interface with Cordova properties
declare global {
  interface Navigator {
    device?: {
      capture?: {
        captureVideo(
          success: (mediaFiles: any[]) => void,
          error: (error: any) => void,
          options?: { limit?: number; duration?: number; quality?: number }
        ): void;
      };
    };
  }
}

export async function capturePhoto(): Promise<File | null> {
  await requestMediaPermissions();
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });

    if (image?.webPath) {
      const response = await fetch(image.webPath);
      const blob = await response.blob();
      return new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
    }
    return null;
  } catch (err) {
    console.error('Error al capturar foto:', err);
    return null;
  }
}

export async function captureVideo(): Promise<File | null> {
  await requestMediaPermissions();
  
  // Primero verificamos si estamos en una plataforma nativa
  if (!Capacitor.isNativePlatform()) {
    console.error('La captura de video nativa solo está disponible en dispositivos móviles');
    return null;
  }

  try {
    console.log('Usando Camera.pickVideo para capturar video');
    // Utilizamos el método pickVideo que permite al usuario seleccionar o grabar un video
    const result = await Camera.pickVideo({
      quality: 90,
    });
    
    console.log('Resultado de pickVideo:', result);
    
    if (result?.path || result?.webPath) {
      const videoPath = result.path || result.webPath;
      console.log('Video capturado en:', videoPath);
      
      try {
        const response = await fetch(videoPath);
        const blob = await response.blob();
        return new File([blob], `video_${Date.now()}.mp4`, { type: 'video/mp4' });
      } catch (fetchError) {
        console.error('Error al procesar el archivo de video:', fetchError);
        return null;
      }
    } else {
      console.log('No se recibió un video válido');
      return null;
    }
  } catch (err) {
    console.error('Error al capturar video:', err);
    
    // Intento fallback con el plugin Cordova
    try {
      console.log('Intentando captura de video con plugin Cordova');
      if (window.navigator && window.navigator.device && window.navigator.device.capture) {
        return new Promise((resolve, reject) => {
          window.navigator.device.capture.captureVideo(
            (mediaFiles) => {
              console.log('Video capturado con plugin Cordova:', mediaFiles);
              if (mediaFiles && mediaFiles.length > 0) {
                const videoPath = mediaFiles[0].fullPath;
                fetch(videoPath)
                  .then(response => response.blob())
                  .then(blob => {
                    const videoFile = new File([blob], `video_${Date.now()}.mp4`, { type: 'video/mp4' });
                    resolve(videoFile);
                  })
                  .catch(error => {
                    console.error('Error al procesar archivo de video:', error);
                    reject(error);
                  });
              } else {
                console.log('No se seleccionó ningún video');
                resolve(null);
              }
            },
            (error) => {
              console.error('Error al capturar video con plugin Cordova:', error);
              reject(error);
            },
            { limit: 1, duration: 30, quality: 1 }
          );
        });
      }
    } catch (cordovaError) {
      console.error('Error con el plugin Cordova:', cordovaError);
    }
    
    return null;
  }
}

let mediaRecorder: MediaObject | null = null;
let recordedPath: string | null = null;

export async function startAudioRecording() {
  await requestMediaPermissions();
  const fileName = `audio_${Date.now()}.m4a`;
  recordedPath = fileName;
  mediaRecorder = Media.create(fileName);
  mediaRecorder.startRecord();
}

export async function stopAudioRecording(): Promise<File | null> {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder || !recordedPath) {
      reject('No hay grabación activa');
      return;
    }

    mediaRecorder.stopRecord();

    setTimeout(async () => {
      try {
        const response = await fetch(recordedPath!);
        const blob = await response.blob();
        const file = new File([blob], recordedPath!, { type: 'audio/m4a' });
        resolve(file);
      } catch (e) {
        console.error('Error al leer grabación:', e);
        reject(e);
      } finally {
        mediaRecorder?.release();
        mediaRecorder = null;
        recordedPath = null;
      }
    }, 1000);
  });
}
