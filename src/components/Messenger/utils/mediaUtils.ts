
import { checkCameraPermissions, requestCameraPermissions } from "@/services/PermissionsHandlerNative";
import { checkCameraAndMicPermissions } from "@/utils/permissions";

// Format recording time (seconds to MM:SS)
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Function to stop media stream tracks
export const stopMediaStream = (stream: MediaStream | null): void => {
  if (stream) {
    try {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      console.log("Stream detenido correctamente");
    } catch (e) {
      console.error("Error al detener stream de medios:", e);
    }
  }
};

// Function to request media permissions (bridge to native permissions)
export const requestMediaPermissions = async (
  type: 'camera' | 'microphone' | 'both',
  setShowPermissionsDialog: (show: boolean) => void
): Promise<boolean> => {
  try {
    console.log(`Verificando permisos de ${type}...`);
    
    // Verificamos si ya tenemos permisos
    let hasPermissions = false;
    
    if (type === 'camera') {
      hasPermissions = await checkCameraPermissions();
    } else if (type === 'microphone') {
      hasPermissions = await checkMicrophonePermissions();
    } else {
      // Para ambos, usamos la verificación completa
      hasPermissions = await checkCameraAndMicPermissions();
    }
    
    if (hasPermissions) {
      console.log('Ya tenemos permisos necesarios');
      return true;
    }
    
    // Si no tenemos permisos, mostramos el diálogo
    console.log('No tenemos permisos, mostrando diálogo...');
    setShowPermissionsDialog(true);
    return false;
  } catch (error) {
    console.error('Error al verificar permisos:', error);
    return false;
  }
};

// Función para verificar permisos de micrófono directamente
export const checkMicrophonePermissions = async (): Promise<boolean> => {
  try {
    try {
      // Intentamos obtener acceso al micrófono y verificar si tenemos permisos
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (stream) {
        // Si logramos obtener el stream, tenemos permisos
        // Detenemos el stream inmediatamente después de verificar
        stopMediaStream(stream);
        return true;
      }
    } catch (err) {
      console.log('No tenemos permisos de micrófono', err);
      return false;
    }
    return false;
  } catch (error) {
    console.error('Error al verificar permisos de micrófono:', error);
    return false;
  }
};

// Función para solicitar permisos de micrófono directamente
export const requestMicrophonePermissions = async (): Promise<boolean> => {
  try {
    console.log('Solicitando permisos de micrófono...');
    
    try {
      // Intentamos obtener acceso al micrófono para solicitar permisos
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (stream) {
        // Si logramos obtener el stream, tenemos permisos
        // Detenemos el stream inmediatamente después de verificar
        stopMediaStream(stream);
        console.log('Permisos de micrófono concedidos');
        return true;
      }
    } catch (err) {
      console.error('Error al solicitar permisos de micrófono:', err);
      return false;
    }
    
    return false;
  } catch (error) {
    console.error('Error general al solicitar permisos de micrófono:', error);
    return false;
  }
};
