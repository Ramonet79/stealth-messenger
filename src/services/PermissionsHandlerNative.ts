
import { Camera, CameraPermissionState, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

/**
 * Verificar si ya tenemos permisos de cámara
 */
export async function checkCameraPermissions(): Promise<boolean> {
  try {
    console.log('Verificando permisos de cámara...');
    
    // Verificar permisos de cámara usando el plugin de Camera
    const cameraPermissions = await Camera.checkPermissions();
    console.log('Estado permisos cámara:', cameraPermissions);
    
    return cameraPermissions.camera === 'granted';
  } catch (error) {
    console.error('Error al verificar permisos de cámara:', error);
    return false;
  }
}

/**
 * Solicitar permisos de cámara
 */
export async function requestCameraPermissions(): Promise<boolean> {
  try {
    console.log('Solicitando permisos de cámara...');
    
    // Solicitar permisos de cámara usando el plugin de Camera
    const cameraPermissions = await Camera.requestPermissions();
    console.log('Resultado de solicitud de cámara:', cameraPermissions);
    
    return cameraPermissions.camera === 'granted';
  } catch (error) {
    console.error('Error al solicitar permisos de cámara:', error);
    return false;
  }
}

/**
 * Tomar una foto usando el plugin nativo de Camera
 */
export async function takePicture(): Promise<string | null> {
  try {
    // Verificar que estamos en un dispositivo nativo
    if (!Capacitor.isNativePlatform()) {
      // Fallback para web - usar getUserMedia
      return takeWebPicture();
    }
    
    console.log('Tomando foto usando plugin nativo...');
    
    // Usar el plugin Camera para tomar una foto
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });
    
    return image.dataUrl || null;
  } catch (error) {
    console.error('Error al tomar foto:', error);
    return null;
  }
}

/**
 * Método alternativo para web usando getUserMedia
 */
async function takeWebPicture(): Promise<string | null> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Tomando foto usando API web...');
      
      // Solicitar acceso a la cámara
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Crear elementos para capturar la imagen
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // Esperar a que el video se cargue
      video.onloadedmetadata = () => {
        // Crear un canvas para capturar la imagen
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Dibujar la imagen del video en el canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          
          // Convertir a dataURL
          const dataUrl = canvas.toDataURL('image/jpeg');
          
          // Detener la transmisión
          stream.getTracks().forEach(track => track.stop());
          
          resolve(dataUrl);
        } else {
          reject(new Error('No se pudo crear el contexto del canvas'));
        }
      };
    } catch (error) {
      console.error('Error al tomar foto web:', error);
      reject(error);
    }
  });
}
