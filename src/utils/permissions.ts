
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export const requestCameraAndMicPermissions = async (): Promise<boolean> => {
  try {
    console.log('Solicitando permisos de cámara y micrófono...');
    
    // Solicitar permisos de cámara usando Camera plugin
    const cameraPerms = await Camera.requestPermissions();
    console.log('Permisos de cámara:', cameraPerms);
    
    // Para micrófono usamos getUserMedia directamente
    let micPermGranted = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Detenemos el stream después de verificar
      stream.getTracks().forEach(track => track.stop());
      micPermGranted = true;
      console.log('Permisos de micrófono concedidos');
    } catch (err) {
      console.error('Error al solicitar permisos de micrófono:', err);
    }

    const granted = cameraPerms.camera === 'granted' && micPermGranted;

    if (!granted) {
      console.warn('Permisos denegados. Cámara:', cameraPerms.camera, 'Micrófono:', micPermGranted);
      if (Capacitor.isNativePlatform()) {
        alert('Debes habilitar los permisos de cámara y micrófono para continuar.');
      }
    }

    return granted;
  } catch (error) {
    console.error('Error al solicitar permisos:', error);
    return false;
  }
};

// Verificación rápida de permisos sin solicitud
export const checkCameraAndMicPermissions = async (): Promise<boolean> => {
  try {
    // Verificar permisos de cámara
    const cameraPerms = await Camera.checkPermissions();
    
    // Verificar permisos de micrófono
    let micPermGranted = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      micPermGranted = true;
    } catch (err) {
      console.log('No tenemos permisos de micrófono');
    }
    
    return cameraPerms.camera === 'granted' && micPermGranted;
  } catch (error) {
    console.error('Error al verificar permisos:', error);
    return false;
  }
};
