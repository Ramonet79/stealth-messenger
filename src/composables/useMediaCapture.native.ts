
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Media, MediaObject } from '@awesome-cordova-plugins/media';
import { Capacitor } from '@capacitor/core';

// 📸 Capturar Foto
export async function capturePhoto(): Promise<File | null> {
  try {
    const photo = await Camera.getPhoto({
      quality: 90,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });

    if (!photo.webPath) return null;
    const response = await fetch(photo.webPath);
    const blob = await response.blob();
    return new File([blob], `photo_${Date.now()}.jpeg`, { type: 'image/jpeg' });
  } catch (err) {
    console.error('Error capturando foto:', err);
    return null;
  }
}

// 🎥 Grabar Video (usando cámara directamente)
export async function recordVideo(): Promise<File | null> {
  try {
    const video = await Camera.getPhoto({
      quality: 90,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      presentationStyle: 'fullscreen'
    });

    if (!video.webPath) return null;
    const response = await fetch(video.webPath);
    const blob = await response.blob();
    return new File([blob], `video_${Date.now()}.mp4`, { type: 'video/mp4' });
  } catch (err) {
    console.error('Error grabando video:', err);
    return null;
  }
}

// 🎙️ Grabar Audio (en Android/iOS con Cordova plugin)
export async function recordAudio(): Promise<File | null> {
  return new Promise((resolve, reject) => {
    if (!Capacitor.isNativePlatform()) {
      console.error('Grabación de audio solo disponible en dispositivo');
      return resolve(null);
    }

    try {
      const filename = `audio_${Date.now()}.m4a`;
      const file: MediaObject = Media.create(filename);

      file.startRecord();
      console.log('🎙 Grabando audio...');

      setTimeout(() => {
        file.stopRecord();
        console.log('✅ Grabación finalizada');

        resolve(new File([], filename, { type: 'audio/m4a' }));
      }, 5000); // Duración: 5 segundos

    } catch (err) {
      console.error('Error al grabar audio:', err);
      resolve(null);
    }
  });
}
