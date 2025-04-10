
import { MediaCapture, MediaFile } from '@awesome-cordova-plugins/media-capture';
import { Filesystem } from '@capacitor/filesystem';

export async function recordVideo(): Promise<File | null> {
  try {
    const mediaFiles = await MediaCapture.captureVideo({ limit: 1, duration: 10 });
    if (!Array.isArray(mediaFiles) || mediaFiles.length === 0) return null;
    return await mediaFileToFile(mediaFiles[0], 'video');
  } catch (err) {
    console.error('Error al grabar video:', err);
    return null;
  }
}

export async function recordAudio(): Promise<File | null> {
  try {
    const mediaFiles = await MediaCapture.captureAudio({ limit: 1, duration: 10 });
    if (!Array.isArray(mediaFiles) || mediaFiles.length === 0) return null;
    return await mediaFileToFile(mediaFiles[0], 'audio');
  } catch (err) {
    console.error('Error al grabar audio:', err);
    return null;
  }
}

async function mediaFileToFile(mediaFile: MediaFile, type: 'video' | 'audio'): Promise<File> {
  const response = await fetch(mediaFile.fullPath);
  const blob = await response.blob();
  const ext = mediaFile.name.split('.').pop();
  return new File([blob], `${type}_${Date.now()}.${ext}`, { type: blob.type });
}

// Add capturePhoto for consistency with web implementation
export async function capturePhoto(): Promise<File | null> {
  // This is a placeholder - in a real implementation, you'd use the Camera plugin
  // But for the purposes of this example, we're focusing on audio and video
  console.warn('capturePhoto not fully implemented in native version');
  return null;
}
