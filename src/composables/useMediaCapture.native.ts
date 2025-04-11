
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Media, MediaObject } from '@awesome-cordova-plugins/media';
import { Capacitor } from '@capacitor/core';

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

    if (!image.webPath) {
      console.error('No se pudo obtener la ruta de la imagen');
      return null;
    }

    const response = await fetch(image.webPath);
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error capturing photo:', error);
    return null;
  }
}

export async function captureVideo(): Promise<Blob | null> {
  try {
    // En Capacitor Camera 4.x, no existe mediaType, usamos getPhoto y el usuario
    // seleccionará un video en la UI nativa
    const video = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });

    if (!video.webPath) {
      console.error('No se pudo obtener la ruta del video');
      return null;
    }

    const response = await fetch(video.webPath);
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error capturing video:', error);
    return null;
  }
}

export function startAudioRecording(): void {
  try {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Audio recording is only available on native platforms');
      return;
    }

    // Generamos un nombre único para el archivo temporal
    const fileName = `recording_${Date.now()}.mp3`;
    // Guardamos la ruta del archivo para usarla después
    audioFilePath = fileName;
    
    // Creamos el objeto de grabación
    audioFile = Media.create(fileName);
    
    // Iniciamos la grabación
    audioFile.startRecord();
    console.log('Recording started with file:', fileName);
  } catch (error) {
    console.error('Error starting audio recording:', error);
  }
}

export function stopAudioRecording(): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (!audioFile) {
      console.warn('No active recording to stop');
      resolve(null);
      return;
    }

    try {
      // Detenemos la grabación
      audioFile.stopRecord();
      console.log('Recording stopped');

      // Damos tiempo al sistema para finalizar la escritura del archivo
      setTimeout(async () => {
        try {
          // Usamos directamente la ruta del archivo que guardamos al iniciar
          // En lugar de usar getFile() que no está disponible
          const response = await fetch(audioFilePath);
          if (!response.ok) {
            throw new Error(`Failed to fetch audio file: ${response.status}`);
          }
          
          const blob = await response.blob();
          console.log('Audio blob created successfully');
          
          // Liberamos recursos
          audioFile?.release();
          audioFile = null;
          
          resolve(blob);
        } catch (e) {
          console.error('Error fetching audio blob:', e);
          
          // Liberamos recursos incluso en caso de error
          audioFile?.release();
          audioFile = null;
          
          resolve(null);
        }
      }, 1000); // Damos un segundo para que el sistema finalice la escritura
    } catch (error) {
      console.error('Error stopping audio recording:', error);
      
      // Liberamos recursos en caso de error
      audioFile?.release();
      audioFile = null;
      
      resolve(null);
    }
  });
}
