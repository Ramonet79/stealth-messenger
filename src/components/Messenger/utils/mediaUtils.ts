
import { Camera } from '@capacitor/camera';
import { isNativePlatform } from '@/services/PermissionsHandlerNative';

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const requestMediaPermissions = async (
  type: 'camera' | 'microphone' | 'both',
  setShowDialog?: (show: boolean) => void
): Promise<boolean> => {
  console.log(`Solicitando permisos de ${type}...`);
  
  try {
    if (isNativePlatform()) {
      // En plataformas nativas
      console.log('Verificando permisos en plataforma nativa');
      
      if (type === 'camera' || type === 'both') {
        const { Camera } = await import('@capacitor/camera');
        const cameraPermission = await Camera.requestPermissions();
        console.log('Estado de permiso de cámara:', cameraPermission.camera);
        
        if (cameraPermission.camera !== 'granted') {
          console.log('Permiso de cámara no concedido');
          return false;
        }
      }
      
      if (type === 'microphone' || type === 'both') {
        // Para micrófono, utilizamos getUserMedia
        try {
          console.log('Solicitando permiso de micrófono...');
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          console.log('Permiso de micrófono concedido');
        } catch (e) {
          console.error('Error al solicitar permiso de micrófono:', e);
          return false;
        }
      }
      
      return true;
    } else {
      // En plataformas web
      console.log('Verificando permisos en web');
      
      if (setShowDialog) {
        console.log('Mostrando diálogo de solicitud de permisos');
        setShowDialog(true);
        return false; // El diálogo se encargará de actualizar el estado
      }
      
      try {
        if (type === 'camera' || type === 'both') {
          console.log('Solicitando acceso a cámara...');
          const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoStream.getTracks().forEach(track => track.stop());
        }
        
        if (type === 'microphone' || type === 'both') {
          console.log('Solicitando acceso a micrófono...');
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioStream.getTracks().forEach(track => track.stop());
        }
        
        console.log('Todos los permisos concedidos');
        return true;
      } catch (e) {
        console.error('Error al solicitar permisos:', e);
        return false;
      }
    }
  } catch (e) {
    console.error('Error general al solicitar permisos:', e);
    return false;
  }
};

export const captureMedia = async (type: 'photo' | 'video'): Promise<Blob | null> => {
  try {
    console.log(`Capturando ${type}...`);
    
    if (isNativePlatform()) {
      const { Camera } = await import('@capacitor/camera');
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: 'base64',
        source: 'CAMERA'
      });
      
      if (image.base64String) {
        const base64Data = image.base64String;
        const byteString = atob(base64Data);
        const mimeType = type === 'photo' ? 'image/jpeg' : 'video/mp4';
        
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        
        return new Blob([ab], { type: mimeType });
      }
    } else {
      // Implementación web
      console.log('Captura de medios no implementada para web');
    }
    
    return null;
  } catch (e) {
    console.error(`Error al capturar ${type}:`, e);
    return null;
  }
};
