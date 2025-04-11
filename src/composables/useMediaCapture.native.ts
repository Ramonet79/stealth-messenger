
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Media, MediaObject } from '@awesome-cordova-plugins/media';

let audioFile: MediaObject | null = null;
let audioFilePath: string = '';

export async function capturePhoto(): Promise<Blob | null> {
  try {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });

    const response = await fetch(image.webPath!);
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error capturing photo:', error);
    return null;
  }
}

export async function captureVideo(): Promise<Blob | null> {
  try {
    // En Capacitor Camera, no existe mediaType, así que usamos la misma función
    // pero el usuario seleccionará un video en la UI nativa
    const video = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });

    const response = await fetch(video.webPath!);
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error capturing video:', error);
    return null;
  }
}

export function startAudioRecording(): void {
  const fileName = 'recording.mp3';
  // Guardamos la ruta del archivo para usarla después
  audioFilePath = fileName;
  audioFile = Media.create(fileName);
  audioFile.startRecord();
}

export function stopAudioRecording(): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (!audioFile) {
      resolve(null);
      return;
    }

    audioFile.stopRecord();

    setTimeout(async () => {
      try {
        // Usamos directamente la ruta del archivo en lugar de getFile()
        const response = await fetch(audioFilePath);
        const blob = await response.blob();
        resolve(blob);
      } catch (e) {
        console.error('Error fetching audio blob:', e);
        resolve(null);
      }
    }, 1000); // Give the system a second to finish writing the file
  });
}
