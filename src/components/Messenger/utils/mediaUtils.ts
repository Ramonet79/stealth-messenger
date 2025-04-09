
import { 
  requestCameraAndMicPermissions, 
  checkCameraAndMicPermissions, 
  requestPermissionsManually 
} from '@/services/PermissionsHandler';

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

// Verificar permisos usando el servicio mejorado
export const checkMediaPermissions = async (type: 'camera' | 'microphone' | 'both'): Promise<boolean> => {
  console.log(`Verificando permisos de ${type}...`);
  return await checkCameraAndMicPermissions();
};

// Solicitar permisos usando el servicio mejorado con un sistema de dos intentos
export const requestMediaPermissions = async (
  type: 'camera' | 'microphone' | 'both',
  onPermissionRequested: (showDialog: boolean) => void
): Promise<boolean> => {
  try {
    // Primero verificamos si ya tenemos permisos
    const hasPermissions = await checkMediaPermissions(type);
    
    if (hasPermissions) {
      console.log(`Ya tenemos permisos de ${type}`);
      return true;
    }
    
    // Si no tenemos permisos, mostramos el diálogo
    console.log(`Necesitamos solicitar permisos de ${type}`);
    onPermissionRequested(true);
    
    // Devolvemos false porque el resultado dependerá de la interacción del usuario
    return false;
  } catch (error) {
    console.error(`Error al solicitar permisos de ${type}:`, error);
    return false;
  }
};
