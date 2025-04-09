
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';

// Verifica si los permisos ya están concedidos (camera + mic)
export const checkCameraAndMicPermissions = async (): Promise<boolean> => {
  console.log('Verificando permisos existentes...');
  
  try {
    // Verificamos si tenemos permisos de cámara con Capacitor
    const cameraPermissions = await Camera.checkPermissions();
    console.log('Estado permisos cámara:', cameraPermissions);
    
    // Verificamos si tenemos permisos de micrófono con getUserMedia
    let microphonePermissions = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (stream) {
        // Detenemos el stream después de verificar
        stream.getTracks().forEach(track => track.stop());
        microphonePermissions = true;
      }
    } catch (err) {
      console.log('No tenemos permisos de micrófono:', err);
    }
    
    const allPermissionsGranted = 
      cameraPermissions.camera === 'granted' && 
      microphonePermissions;
    
    console.log('¿Todos los permisos concedidos?', allPermissionsGranted);
    
    return allPermissionsGranted;
  } catch (error) {
    console.error('Error al verificar permisos:', error);
    return false;
  }
};

// Solicita permisos de cámara y micrófono secuencialmente
export const requestCameraAndMicPermissions = async (): Promise<boolean> => {
  console.log('Solicitando permisos de cámara y micrófono...');
  
  try {
    if (!Capacitor.isNativePlatform()) {
      // En web, solicitamos ambos permisos juntos
      console.log('Solicitando permisos en web...');
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          console.log('Permisos web concedidos');
          return true;
        }
      } catch (err) {
        console.error('Error al solicitar permisos web:', err);
        return false;
      }
    }
    
    // En Android, solicitamos los permisos uno por uno con delay entre ellos
    console.log('Solicitando permiso de cámara...');
    const cameraPermissions = await Camera.requestPermissions();
    
    // Esperamos 1 segundo antes de la siguiente solicitud
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Para micrófono, usamos getUserMedia
    console.log('Solicitando permiso de micrófono...');
    let microphoneGranted = false;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        microphoneGranted = true;
        console.log('Permiso de micrófono concedido');
      }
    } catch (err) {
      console.error('Error al solicitar permiso de micrófono:', err);
    }
    
    const allPermissionsGranted = 
      cameraPermissions.camera === 'granted' && 
      microphoneGranted;
    
    console.log('Resultado final permisos:', allPermissionsGranted);
    
    return allPermissionsGranted;
  } catch (err) {
    console.error('Error general al solicitar permisos:', err);
    return false;
  }
};

// Intento alternativo para dispositivos problemáticos
export const requestPermissionsManually = async (): Promise<boolean> => {
  console.log('Solicitando permisos manualmente uno por uno...');
  
  try {
    // Primero solicitamos permisos de cámara con un timeout para evitar bloqueos
    const cameraPromise = Camera.requestPermissions();
    const cameraTimeoutPromise = new Promise<{camera: string}>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout solicitando permiso de cámara')), 5000);
    });
    
    let cameraResult;
    try {
      cameraResult = await Promise.race([cameraPromise, cameraTimeoutPromise]);
      console.log('Resultado permiso cámara:', cameraResult);
    } catch (err) {
      console.error('Error o timeout en permiso de cámara:', err);
      cameraResult = { camera: 'denied' };
    }
    
    // Esperamos un segundo antes de la siguiente solicitud
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Luego solicitamos permiso de micrófono con timeout
    console.log('Solicitando permiso de micrófono...');
    
    let microphoneGranted = false;
    try {
      const micPromise = navigator.mediaDevices.getUserMedia({ audio: true });
      const micTimeoutPromise = new Promise<MediaStream>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout solicitando permiso de micrófono')), 5000);
      });
      
      const stream = await Promise.race([micPromise, micTimeoutPromise]);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        microphoneGranted = true;
        console.log('Permiso de micrófono concedido');
      }
    } catch (err) {
      console.error('Error o timeout en permiso de micrófono:', err);
    }
    
    const allPermissionsGranted = 
      cameraResult.camera === 'granted' && 
      microphoneGranted;
    
    console.log('Resultado final permisos manuales:', allPermissionsGranted);
    
    return allPermissionsGranted;
  } catch (error) {
    console.error('Error general en solicitud manual de permisos:', error);
    return false;
  }
};
