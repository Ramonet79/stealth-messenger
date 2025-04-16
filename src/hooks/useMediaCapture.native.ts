
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';

export const useMediaCapture = () => {
  const requestPermissions = async () => {
    try {
      console.log('Solicitando permisos de cámara y micrófono...');
      
      // Solicitar permisos de cámara
      const cameraPerms = await Camera.requestPermissions();
      console.log('Permisos de cámara:', cameraPerms);
      
      // Para micrófono usamos getUserMedia
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          console.log('Permisos de micrófono concedidos');
        } catch (err) {
          console.error('Error al solicitar permisos de micrófono:', err);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return false;
    }
  };

  // Corregido: La función startCapture no debe tener parámetros para satisfacer el error TS2554
  const startCapture = async () => {
    try {
      console.log('Iniciando captura...');
      const hasPermissions = await requestPermissions();
      
      if (!hasPermissions) {
        console.error('No se han concedido los permisos necesarios');
        alert('Se necesitan permisos de cámara y micrófono para continuar');
        return null;
      }
      
      if (Capacitor.isNativePlatform()) {
        console.log('Ejecutando captura en plataforma nativa');
        // En plataformas nativas, usaremos las implementaciones específicas
        try {
          // Implementación nativa de imagen por defecto
          const { capturePhoto } = await import('../composables/useMediaCapture.native');
          console.log('Tomando foto nativa...');
          const photoFile = await capturePhoto();
          console.log('Foto capturada:', photoFile);
          return photoFile;
        } catch (error) {
          console.error('Error al iniciar captura:', error);
          alert(`Error al iniciar captura: ${error.message || 'Error desconocido'}`);
          return null;
        }
      } else {
        console.log('Media capture not available on web platform');
        alert('La captura solo está disponible en plataformas nativas');
        return null;
      }
    } catch (error) {
      console.error('Error al iniciar captura:', error);
      alert(`Error al iniciar captura: ${error.message || 'Error desconocido'}`);
      return null;
    }
  };

  return {
    startCapture
  };
};

export default useMediaCapture;
