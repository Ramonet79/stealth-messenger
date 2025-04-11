
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

export async function recordVideo(): Promise<File | null> {
  await requestMediaPermissions();
  try {
    const video = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });

    if (video?.webPath) {
      const response = await fetch(video.webPath);
      const blob = await response.blob();
      return new File([blob], `video_${Date.now()}.mp4`, { type: 'video/mp4' });
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
