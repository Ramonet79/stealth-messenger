
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';

// Función para solicitar permisos de cámara y micrófono
export const requestCameraAndMicPermissions = async (): Promise<boolean> => {
  console.log('Solicitando permisos de cámara y micrófono...');
  
  try {
    if (Capacitor.isNativePlatform()) {
      // En plataformas nativas, usamos los plugins de Capacitor
      console.log('Solicitando permisos en plataforma nativa...');
      
      // Solicitar permisos de cámara con Capacitor
      const cameraPermissions = await Camera.requestPermissions();
      console.log('Resultado permisos cámara:', cameraPermissions);
      
      // Para micrófono, usamos la API del navegador
      let micPermission = false;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (stream) {
          // Detener el stream después de obtener permisos
          stream.getTracks().forEach(track => track.stop());
          micPermission = true;
          console.log('Permiso de micrófono concedido');
        }
      } catch (err) {
        console.error('Error al solicitar permiso de micrófono:', err);
      }
      
      // Verificamos que ambos permisos fueron concedidos
      return cameraPermissions.camera === 'granted' && micPermission;
    } else {
      // En web, usamos las APIs del navegador
      console.log('Solicitando permisos en web...');
      
      // Implementación para navegador web
      try {
        // Para cámara y micrófono juntos
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        // Detener el stream después de obtener permisos
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          console.log('Permisos web concedidos');
          return true;
        }
      } catch (err) {
        console.error('Error al solicitar permisos web:', err);
      }
    }
    
    return false;
  } catch (err) {
    console.error('Error general al solicitar permisos:', err);
    return false;
  }
};

// Función para verificar si ya tenemos permisos
export const checkCameraAndMicPermissions = async (): Promise<boolean> => {
  console.log('Verificando permisos existentes...');
  
  try {
    // Intentamos obtener un stream - si funciona, tenemos permisos
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });
    
    // Detenemos el stream después de verificar
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      console.log('Ya tenemos permisos de cámara y micrófono');
      return true;
    }
    
    return false;
  } catch (error) {
    console.log('No tenemos permisos o hay un error:', error);
    return false;
  }
};
