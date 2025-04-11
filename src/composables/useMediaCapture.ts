import {
  MediaCapture,
  CaptureAudioOptions,
  CaptureImageOptions,
  CaptureVideoOptions,
  MediaFile
} from '@whiteguru/capacitor-plugin-media-capture'

// 🔄 Utilidad: convierte MediaFile a File compatible con Supabase
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
    const options: CaptureImageOptions = { limit: 1 }
    const result = await MediaCapture.captureImage(options)

    if (!result.files || result.files.length === 0) return null
    return await mediaFileToFile(result.files[0], 'photo')
  } catch (error) {
    console.error('Error al capturar foto:', error)
    return null
  }
}

// 🎥 VÍDEO
export async function recordVideo(): Promise<File | null> {
  try {
    const options: CaptureVideoOptions = { limit: 1, duration: 10 }
    const result = await MediaCapture.captureVideo(options)

    if (!result.files || result.files.length === 0) return null
    return await mediaFileToFile(result.files[0], 'video')
  } catch (error) {
    console.error('Error al grabar vídeo:', error)
    return null
  }
}

// 🎙️ AUDIO
export async function recordAudio(): Promise<File | null> {
  try {
    const options: CaptureAudioOptions = { limit: 1, duration: 10 }
    const result = await MediaCapture.captureAudio(options)

    if (!result.files || result.files.length === 0) return null
    return await mediaFileToFile(result.files[0], 'audio')
  } catch (error) {
    console.error('Error al grabar audio:', error)
    return null
  }
}
