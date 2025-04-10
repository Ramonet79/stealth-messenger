
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

// Define una función para verificar si estamos en una plataforma nativa
const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

// Función para verificar permisos de cámara
export const checkCameraPermissions = async (): Promise<boolean> => {
  try {
    if (!isNativePlatform()) {
      console.log('No estamos en plataforma nativa, asumiendo que tenemos permisos');
      return true;
    }

    const perms = await Camera.checkPermissions();
    console.log('Estado de permisos de cámara:', perms);
    
    return perms.camera === 'granted';
  } catch (e) {
    console.error('Error al verificar permisos de cámara:', e);
    return false;
  }
};

// Función para solicitar permisos de cámara
export const requestCameraPermissions = async (): Promise<boolean> => {
  try {
    if (!isNativePlatform()) {
      console.log('No estamos en plataforma nativa, asumiendo que tenemos permisos');
      return true;
    }

    const perms = await Camera.requestPermissions();
    console.log('Permisos de cámara después de solicitud:', perms);
    
    return perms.camera === 'granted';
  } catch (e) {
    console.error('Error al solicitar permisos de cámara:', e);
    return false;
  }
};

// Función para capturar una imagen
export const captureImage = async () => {
  try {
    console.log('Iniciando captura de imagen con Camera.getPhoto');
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      promptLabelHeader: 'Cámara',
      promptLabelCancel: 'Cancelar',
      promptLabelPhoto: 'Biblioteca',
      promptLabelPicture: 'Tomar foto'
    });
    
    console.log('Imagen capturada correctamente');
    return {
      dataUrl: image.dataUrl,
      success: true
    };
  } catch (e) {
    console.error('Error al capturar imagen:', e);
    return {
      dataUrl: null,
      success: false,
      error: e
    };
  }
};

// Función para tomar una foto (alias de captureImage para mantener compatibilidad)
export const takePicture = async (): Promise<string | null> => {
  try {
    const result = await captureImage();
    if (result.success && result.dataUrl) {
      return result.dataUrl;
    }
    return null;
  } catch (e) {
    console.error('Error en takePicture:', e);
    return null;
  }
};

// Función para capturar audio
export const captureAudioNative = async (): Promise<string | null> => {
  try {
    if (!isNativePlatform()) {
      // En navegador web, usar MediaRecorder
      return null;
    }
    
    // Usamos Camera.getPhoto pero con configuración especial para intentar capturar audio
    console.log('Intentando capturar audio con Camera.getPhoto');
    const audio = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt, // Esto mostrará todas las opciones incluyendo grabadora de audio
      promptLabelHeader: 'Audio',
      promptLabelCancel: 'Cancelar',
      promptLabelPhoto: 'Biblioteca',
      promptLabelPicture: 'Grabar Audio'
    });
    
    console.log('Audio capturado correctamente', audio);
    
    if (audio && audio.webPath) {
      return audio.webPath;
    }
    return null;
  } catch (e) {
    console.error('Error al capturar audio:', e);
    return null;
  }
};

// Función para capturar video
export const captureVideoNative = async (): Promise<string | null> => {
  try {
    if (!isNativePlatform()) {
      // En navegador web, usar MediaRecorder
      return null;
    }
    
    // Usamos getPhoto que en algunos dispositivos abre la cámara de video
    console.log('Intentando capturar video con Camera.getPhoto');
    const video = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      promptLabelHeader: 'Video',
      promptLabelCancel: 'Cancelar',
      promptLabelPhoto: 'Biblioteca',
      promptLabelPicture: 'Grabar Video'
    });
    
    console.log('Video capturado correctamente', video);
    
    if (video && video.webPath) {
      return video.webPath;
    }
    return null;
  } catch (e) {
    console.error('Error al capturar video:', e);
    return null;
  }
};

// Función para iniciar captura de audio (interfaz compatible para AudioCapture.tsx)
export const captureAudio = async (): Promise<MediaRecorder | null> => {
  try {
    console.log('Iniciando captura de audio');
    
    // Si estamos en plataforma nativa, usamos captureAudioNative
    if (isNativePlatform()) {
      console.log('Plataforma nativa detectada, usando captura nativa');
      // Devolvemos null porque en plataforma nativa no usamos MediaRecorder
      // El componente AudioCapture.tsx verificará si estamos en plataforma nativa
      return null;
    }
    
    // Solicitamos acceso al micrófono directamente
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    if (!stream) {
      console.error('No se pudo obtener el stream de audio');
      return null;
    }
    
    // Creamos el grabador
    const mediaRecorder = new MediaRecorder(stream);
    console.log('MediaRecorder de audio creado correctamente');
    return mediaRecorder;
  } catch (e) {
    console.error('Error al iniciar captura de audio:', e);
    return null;
  }
};

// Función para iniciar captura de video (interfaz compatible para VideoCapture.tsx)
export const captureVideo = async (): Promise<{stream: MediaStream, recorder: MediaRecorder} | null> => {
  try {
    console.log('Iniciando captura de video');
    
    // Si estamos en plataforma nativa, usamos captureVideoNative
    if (isNativePlatform()) {
      console.log('Plataforma nativa detectada, usando captura nativa');
      // Devolvemos null porque en plataforma nativa no usamos MediaRecorder
      // El componente VideoCapture.tsx verificará si estamos en plataforma nativa
      return null;
    }
    
    // Solicitamos acceso a la cámara y micrófono directamente
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' },
      audio: true 
    });
    
    if (!stream) {
      console.error('No se pudo obtener el stream de video');
      return null;
    }
    
    // Creamos el grabador
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp8,opus'
    });
    
    console.log('MediaRecorder de video creado correctamente');
    return { stream, recorder: mediaRecorder };
  } catch (e) {
    console.error('Error al iniciar captura de video:', e);
    return null;
  }
};

