
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';

// Declaramos la interfaz global para el plugin de Cordova Media Capture
declare global {
  interface Navigator {
    device?: {
      capture?: {
        captureVideo: (
          success: (mediaFiles: any[]) => void,
          error: (error: any) => void,
          options?: { limit?: number; duration?: number; quality?: number }
        ) => void;
        captureImage: (
          success: (mediaFiles: any[]) => void,
          error: (error: any) => void,
          options?: { limit?: number; }
        ) => void;
      };
    };
  }
}

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

  // Método principal para iniciar la captura (foto, video, audio)
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
        // Verificamos que estamos en plataforma nativa
        if (type === 'media' || type === 'image' || type === 'video') {
          // Verificamos si el plugin Cordova está disponible
          if (window.navigator && window.navigator.device?.capture) {
            console.log('Usando plugin Cordova para captura nativa completa');
            
            return new Promise((resolve, reject) => {
              // Si es captura de video o captura unificada (media), lanzamos captura de video
              if (type === 'video' || type === 'media') {
                window.navigator.device?.capture?.captureVideo(
                  (mediaFiles) => {
                    console.log('Archivos capturados con plugin Cordova:', mediaFiles);
                    
                    if (mediaFiles && mediaFiles.length > 0) {
                      const mediaPath = mediaFiles[0].fullPath;
                      console.log('Ruta del archivo capturado:', mediaPath);
                      
                      // Procesamos el archivo
                      fetch(mediaPath)
                        .then(response => response.blob())
                        .then(blob => {
                          // Determinamos si es video por la extensión o tipo
                          const isVideo = 
                            mediaPath.toLowerCase().endsWith('.mp4') || 
                            mediaPath.toLowerCase().endsWith('.mov') ||
                            blob.type.startsWith('video/');
                          
                          const extension = isVideo ? '.mp4' : '.jpg';
                          const mediaType = isVideo ? 'video/mp4' : 'image/jpeg';
                          const filePrefix = isVideo ? 'video' : 'photo';
                          
                          const mediaFile = new File(
                            [blob], 
                            `${filePrefix}_${Date.now()}${extension}`, 
                            { type: mediaType }
                          );
                          
                          console.log(`Archivo multimedia procesado (${mediaFile.type}), tamaño: ${mediaFile.size} bytes`);
                          resolve(mediaFile);
                        })
                        .catch(error => {
                          console.error('Error al procesar archivo multimedia:', error);
                          reject(error);
                        });
                    } else {
                      console.log('No se seleccionó ningún archivo');
                      resolve(null);
                    }
                  },
                  (error) => {
                    console.error('Error en captura Cordova:', error);
                    reject(error);
                  },
                  { limit: 1, duration: 60, quality: 1 }
                );
              }
              // Si es específicamente captura de imagen
              else if (type === 'image') {
                window.navigator.device?.capture?.captureImage(
                  (mediaFiles) => {
                    console.log('Imágenes capturadas con plugin Cordova:', mediaFiles);
                    
                    if (mediaFiles && mediaFiles.length > 0) {
                      const mediaPath = mediaFiles[0].fullPath;
                      console.log('Ruta de la imagen capturada:', mediaPath);
                      
                      // Procesamos la imagen
                      fetch(mediaPath)
                        .then(response => response.blob())
                        .then(blob => {
                          const imageFile = new File(
                            [blob], 
                            `photo_${Date.now()}.jpg`, 
                            { type: 'image/jpeg' }
                          );
                          
                          console.log(`Imagen procesada, tamaño: ${imageFile.size} bytes`);
                          resolve(imageFile);
                        })
                        .catch(error => {
                          console.error('Error al procesar imagen:', error);
                          reject(error);
                        });
                    } else {
                      console.log('No se capturó ninguna imagen');
                      resolve(null);
                    }
                  },
                  (error) => {
                    console.error('Error en captura de imagen Cordova:', error);
                    reject(error);
                  },
                  { limit: 1 }
                );
              }
            });
          } else {
            // Fallback a Camera API si el plugin Cordova no está disponible
            console.log('Plugin Cordova no disponible, usando Camera API como fallback');
            
            try {
              // Usamos getPhoto como último recurso (solo fotos)
              const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: 'uri'
              });
              
              if (image && image.webPath) {
                console.log('Imagen capturada con Camera.getPhoto:', image.webPath);
                const response = await fetch(image.webPath);
                const blob = await response.blob();
                return new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
              }
            } catch (error) {
              console.error('Error en fallback de Camera.getPhoto:', error);
            }
          }
        } else if (type === 'audio') {
          // Mantener la implementación actual para audio
          console.log('Iniciando captura de audio nativa');
          const { startAudioRecording } = await import('../composables/useMediaCapture.native');
          await startAudioRecording();
          return true;
        }
      } else {
        // Implementación web
        console.log(`Captura de ${type} no disponible completamente en web`);
        alert(`La captura de ${type} con todas las opciones solo está disponible en dispositivos móviles`);
        
        // Fallback simple para web (solo imágenes)
        if (type === 'image' || type === 'media') {
          try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = type === 'image' ? 'image/*' : 'image/*,video/*';
            input.click();
            
            return new Promise((resolve) => {
              input.onchange = () => {
                if (input.files && input.files.length > 0) {
                  resolve(input.files[0]);
                } else {
                  resolve(null);
                }
              };
            });
          } catch (e) {
            console.error('Error en captura web:', e);
            return null;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Error general en startCapture:`, error);
      alert(`Error al iniciar captura: ${error.message || 'Error desconocido'}`);
      return null;
    }
  };

  return {
    startCapture
  };
};

export default useMediaCapture;
