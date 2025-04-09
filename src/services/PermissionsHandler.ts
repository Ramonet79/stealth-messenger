
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';

// Función simplificada para solicitar permisos de cámara y micrófono
export const requestCameraAndMicPermissions = async (): Promise<boolean> => {
  console.log('Solicitando permisos de cámara y micrófono...');
  
  try {
    if (Capacitor.isNativePlatform()) {
      console.log('Solicitando permisos en plataforma nativa...');
      
      // En Android, solicitamos los permisos directamente al sistema
      if (Capacitor.getPlatform() === 'android') {
        // Solicitamos permisos de cámara con Capacitor
        const cameraPermissions = await Camera.requestPermissions();
        console.log('Resultado permisos cámara:', cameraPermissions);

        // Para micrófono, usamos getUserMedia con un timeout para asegurar que la solicitud se complete
        let microphoneGranted = false;
        try {
          const timeoutPromise = new Promise<MediaStream | null>((_, reject) => {
            setTimeout(() => reject(new Error('Timeout solicitando permiso de micrófono')), 3000);
          });
          
          const streamPromise = navigator.mediaDevices.getUserMedia({ audio: true });
          
          // Usamos Promise.race para evitar que se quede colgado
          const stream = await Promise.race([streamPromise, timeoutPromise]) as MediaStream;
          
          if (stream) {
            // Detener el stream después de obtener permisos
            stream.getTracks().forEach(track => track.stop());
            microphoneGranted = true;
            console.log('Permiso de micrófono concedido');
          }
        } catch (err) {
          console.error('Error al solicitar permiso de micrófono:', err);
        }
        
        // Devolvemos verdadero si ambos permisos fueron concedidos
        return cameraPermissions.camera === 'granted' && microphoneGranted;
      } 
      
      // Para iOS
      else if (Capacitor.getPlatform() === 'ios') {
        // En iOS solicitamos permisos de cámara
        const cameraPermissions = await Camera.requestPermissions();
        
        // Para micrófono, usamos getUserMedia
        let microphoneGranted = false;
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
            microphoneGranted = true;
          }
        } catch (err) {
          console.error('Error al solicitar permiso de micrófono en iOS:', err);
        }
        
        return cameraPermissions.camera === 'granted' && microphoneGranted;
      }
    } 
    
    // En web, usamos las APIs del navegador
    else {
      console.log('Solicitando permisos en web...');
      
      try {
        // Solicitamos permisos para cámara y micrófono
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        // Detenemos el stream después de obtener permisos
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          console.log('Permisos web concedidos');
          return true;
        }
      } catch (err) {
        console.error('Error al solicitar permisos web:', err);
      }
    }
    
    // Si llegamos aquí, algo falló
    return false;
  } catch (err) {
    console.error('Error general al solicitar permisos:', err);
    return false;
  }
};

// Función para solicitar permisos manualmente uno por uno
export const requestPermissionsManually = async (): Promise<boolean> => {
  if (Capacitor.getPlatform() !== 'android') {
    return requestCameraAndMicPermissions();
  }
  
  console.log('Solicitando permisos manualmente uno por uno...');
  
  try {
    // Primero solicitamos permisos de cámara
    const cameraResult = await Camera.requestPermissions();
    console.log('Resultado permiso cámara:', cameraResult);
    
    // Esperamos un segundo antes de la siguiente solicitud
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Luego solicitamos permiso de micrófono
    let microphoneGranted = false;
    try {
      console.log('Solicitando permiso de micrófono...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        microphoneGranted = true;
        console.log('Permiso de micrófono concedido');
      }
    } catch (err) {
      console.error('Error al solicitar permiso de micrófono:', err);
    }
    
    return cameraResult.camera === 'granted' && microphoneGranted;
  } catch (error) {
    console.error('Error en solicitud manual de permisos:', error);
    return false;
  }
};

// Función para verificar si ya tenemos permisos
export const checkCameraAndMicPermissions = async (): Promise<boolean> => {
  console.log('Verificando permisos existentes...');
  
  try {
    // Verificamos si tenemos permisos de cámara
    const cameraPermissions = await Camera.checkPermissions();
    console.log('Estado permisos cámara:', cameraPermissions);
    
    // Verificamos si tenemos permisos de micrófono
    let microphoneGranted = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        microphoneGranted = true;
      }
    } catch (err) {
      console.log('No tenemos permisos de micrófono:', err);
    }
    
    return cameraPermissions.camera === 'granted' && microphoneGranted;
  } catch (error) {
    console.log('Error al verificar permisos:', error);
    return false;
  }
};
