
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Media, MediaObject } from '@awesome-cordova-plugins/media';
import { Capacitor } from '@capacitor/core';
import { requestMediaPermissions } from './usePermissions';

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
  try {
    console.log('Intentando capturar video con plugin de Cordova');
    
    // Intentamos usar el plugin de Cordova para captura de video
    if (window.navigator && window.navigator.device && window.navigator.device.capture) {
      return new Promise((resolve, reject) => {
        window.navigator.device.capture.captureVideo(
          (mediaFiles) => {
            console.log('Video capturado con éxito:', mediaFiles);
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
    } else {
      // Fallback al método Camera.getPhoto con opciones específicas para video
      console.log('Plugin de captura no disponible, intentando con Camera API');
      const video = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        // Intentamos forzar el modo de video
        saveToGallery: true,
        presentationStyle: 'fullscreen',
        promptLabelHeader: 'Capturar Video',
        promptLabelPicture: 'Grabar Video',
        webUseInput: true,
      });

      if (video?.webPath) {
        const response = await fetch(video.webPath);
        const blob = await response.blob();
        return new File([blob], `video_${Date.now()}.mp4`, { type: 'video/mp4' });
      }
    }
    return null;
  } catch (err) {
    console.error('Error al grabar video:', err);
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
