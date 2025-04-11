
import {
  MediaCapture,
  MediaCaptureOptions,
  MediaCapturePlugin,
  MediaFile
} from '@whiteguru/capacitor-plugin-media-capture';

// 🔄 Utilidad: convierte MediaFile a File compatible con Supabase o Web
async function mediaFileToFile(mediaFile: MediaFile, type: 'photo' | 'video' | 'audio'): Promise<File> {
  const response = await fetch(mediaFile.path!)
  const blob = await response.blob()
  const extension = mediaFile.name?.split('.').pop() || 'dat'
  const mime = blob.type || `${type}/${extension}`

  return new File([blob], `${type}_${Date.now()}.${extension}`, { type: mime })
}

// 📸 FOTO
export async function capturePhoto(): Promise<File | null> {
  try {
    const options: MediaCaptureOptions = { 
      mode: 'photo',
      quality: 90 
    };
    const result = await MediaCapture.capture(options);

    if (!result.file) return null;
    return await mediaFileToFile(result.file, 'photo');
  } catch (error) {
    console.error('Error al capturar foto:', error);
    return null;
  }
}

// 🎥 VÍDEO
export async function recordVideo(): Promise<File | null> {
  try {
    const options: MediaCaptureOptions = { 
      mode: 'video',
      duration: 10,
      quality: 80
    };
    const result = await MediaCapture.capture(options);

    if (!result.file) return null;
    return await mediaFileToFile(result.file, 'video');
  } catch (error) {
    console.error('Error al grabar vídeo:', error);
    return null;
  }
}

// 🎙️ AUDIO
export async function recordAudio(): Promise<File | null> {
  try {
    const options: MediaCaptureOptions = { 
      mode: 'audio',
      duration: 10
    };
    const result = await MediaCapture.capture(options);

    if (!result.file) return null;
    return await mediaFileToFile(result.file, 'audio');
  } catch (error) {
    console.error('Error al grabar audio:', error);
    return null;
  }
}
