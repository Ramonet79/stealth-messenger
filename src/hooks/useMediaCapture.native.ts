
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

  const startCapture = async (type = 'media') => {
    try {
      console.log(`Iniciando captura de ${type}...`);
      const hasPermissions = await requestPermissions();
      
      if (!hasPermissions) {
        console.error('No se han concedido los permisos necesarios');
        alert('Se necesitan permisos de cámara y micrófono para continuar');
        return null;
      }
      
      if (Capacitor.isNativePlatform()) {
        console.log(`Ejecutando captura nativa unificada`);
        
        try {
          // Si el tipo es media, usamos la interfaz nativa completa que permite elegir entre foto y video
          if (type === 'media') {
            // La mejor opción es utilizar pickVideo que abre la interfaz completa de la cámara
            // donde el usuario puede elegir entre foto y video (como WhatsApp)
            console.log('Utilizando Camera.pickVideo para interfaz unificada foto/video');
            const result = await Camera.pickVideo({
              quality: 90,
              // No establecemos saveToGallery para que el usuario decida si guardar
            });
            
            console.log('Resultado de captura unificada:', result);
            
            if (result?.path || result?.webPath) {
              const mediaPath = result.path || result.webPath;
              console.log('Archivo capturado correctamente en:', mediaPath);
              
              try {
                console.log('Procesando archivo multimedia capturado...');
                const response = await fetch(mediaPath);
                const blob = await response.blob();
                
                // Determinamos si es video o imagen basándonos en el tipo MIME
                const isVideo = blob.type.startsWith('video/');
                const extension = isVideo ? '.mp4' : '.jpg';
                const mediaType = isVideo ? 'video/mp4' : 'image/jpeg';
                const filePrefix = isVideo ? 'video' : 'photo';
                
                const mediaFile = new File(
                  [blob], 
                  `${filePrefix}_${Date.now()}${extension}`, 
                  { type: mediaType }
                );
                
                console.log(`Archivo ${isVideo ? 'video' : 'foto'} procesado exitosamente, tamaño:`, mediaFile.size, 'bytes');
                return mediaFile;
              } catch (fetchError) {
                console.error('Error al procesar el archivo multimedia:', fetchError);
                return null;
              }
            } else {
              console.log('No se recibió un archivo válido o el usuario canceló la captura');
              return null;
            }
          } else if (type === 'image') {
            // Mantener el comportamiento actual para captura específica de imágenes
            console.log('Utilizando capturePhoto desde composables/useMediaCapture.native');
            const { capturePhoto } = await import('../composables/useMediaCapture.native');
            console.log('Tomando foto nativa...');
            const photoFile = await capturePhoto();
            console.log('Foto capturada:', photoFile);
            return photoFile;
          } else if (type === 'audio') {
            // Mantener el comportamiento actual para audio
            console.log('Utilizando plugin nativo para grabación de audio');
            const { startAudioRecording, stopAudioRecording } = await import('../composables/useMediaCapture.native');
            await startAudioRecording();
            return true;
          }
        } catch (error) {
          console.error(`Error al iniciar captura unificada:`, error);
          alert(`Error al iniciar captura: ${error.message || 'Error desconocido'}`);
          return null;
        }
      } else {
        console.log(`Media capture (${type}) not available on web platform`);
        alert(`La captura de ${type} solo está disponible en plataformas nativas`);
        return null;
      }
    } catch (error) {
      console.error(`Error al iniciar captura:`, error);
      alert(`Error al iniciar captura: ${error.message || 'Error desconocido'}`);
      return null;
    }
  };

  return {
    startCapture
  };
};

export default useMediaCapture;
