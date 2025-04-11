
import { MediaCapture } from '@whiteguru/capacitor-plugin-media-capture';

// 🔄 Utilidad: convierte el resultado a File compatible con Supabase o Web
async function resultToFile(path: string, type: 'photo' | 'video' | 'audio'): Promise<File> {
  try {
    const response = await fetch(path);
    const blob = await response.blob();
    const extension = path.split('.').pop() || 'dat';
    const mime = blob.type || `${type}/${extension}`;

    return new File([blob], `${type}_${Date.now()}.${extension}`, { type: mime });
  } catch (error) {
    console.error('Error al convertir resultado a File:', error);
    throw error;
  }
}

// 📸 FOTO - Adaptado a través de captureVideo
export async function capturePhoto(): Promise<File | null> {
  try {
    console.log('Intentando capturar foto usando captureVideo como alternativa');
    // Usamos captureVideo con duración corta como alternativa
    const result = await MediaCapture.captureVideo({
      quality: 'hd',
      duration: 1, // Duración mínima para simular captura de foto
    });

    if (!result || !result.file) return null;
    console.log('Resultado de captura:', result.file);
    return await resultToFile(result.file.path, 'photo');
  } catch (error) {
    console.error('Error al capturar foto:', error);
    return null;
  }
}

// 🎥 VÍDEO
export async function recordVideo(): Promise<File | null> {
  try {
    const result = await MediaCapture.captureVideo({
      duration: 30,
      quality: 'hd',
    });

    if (!result || !result.file) return null;
    console.log('Video capturado:', result.file);
    return await resultToFile(result.file.path, 'video');
  } catch (error) {
    console.error('Error al grabar vídeo:', error);
    return null;
  }
}

// 🎙️ AUDIO - Adaptado a través de captureVideo
export async function recordAudio(): Promise<File | null> {
  try {
    console.log('Intentando capturar audio usando captureVideo como alternativa');
    // Usamos captureVideo, pero indicamos al usuario que es para audio
    const result = await MediaCapture.captureVideo({
      quality: 'sd',
      duration: 30,
    });

    if (!result || !result.file) return null;
    console.log('Audio capturado (mediante video):', result.file);
    return await resultToFile(result.file.path, 'audio');
  } catch (error) {
    console.error('Error al grabar audio:', error);
    return null;
  }
}
