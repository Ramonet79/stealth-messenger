
import { checkCameraPermissions } from "@/services/PermissionsHandlerNative";
import { requestCameraAndMicPermissions, checkCameraAndMicPermissions } from "@/utils/permissions";

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
    } else {
      // Para micrófono o ambos, usamos la verificación completa
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
