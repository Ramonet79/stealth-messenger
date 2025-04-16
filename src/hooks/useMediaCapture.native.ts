
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

  const startCapture = async (type: 'audio' | 'video' | 'image' = 'image') => {
    try {
      console.log(`Iniciando captura de ${type}...`);
      const hasPermissions = await requestPermissions();
      
      if (!hasPermissions) {
        console.error('No se han concedido los permisos necesarios');
        alert('Se necesitan permisos de cámara y micrófono para continuar');
        return null;
      }
      
      if (Capacitor.isNativePlatform()) {
        console.log(`Ejecutando captura de ${type} en plataforma nativa`);
        // En plataformas nativas, usaremos las implementaciones específicas
        if (type === 'audio') {
          // Implementación nativa de audio usando el módulo correspondiente
          const { startAudioRecording } = await import('../composables/useMediaCapture.native');
          console.log('Iniciando grabación de audio nativa...');
          startAudioRecording();
          return true;
        } else if (type === 'video') {
          // Implementación nativa de video
          const { captureVideo } = await import('../composables/useMediaCapture.native');
          console.log('Iniciando grabación de video nativa...');
          const videoFile = await captureVideo();
          console.log('Video capturado:', videoFile);
          return videoFile;
        } else {
          // Implementación nativa de imagen
          const { capturePhoto } = await import('../composables/useMediaCapture.native');
          console.log('Tomando foto nativa...');
          const photoFile = await capturePhoto();
          console.log('Foto capturada:', photoFile);
          return photoFile;
        }
      } else {
        console.log('Media capture not available on web platform');
        alert(`La captura de ${type} solo está disponible en plataformas nativas`);
        return null;
      }
    } catch (error) {
      console.error(`Error al iniciar captura de ${type}:`, error);
      alert(`Error al iniciar captura de ${type}: ${error.message || 'Error desconocido'}`);
      return null;
    }
  };

  return {
    startCapture
  };
};

export default useMediaCapture;
