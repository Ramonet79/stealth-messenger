
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

// Función simple para comprobar permisos
export const checkMediaPermissions = async (type: 'camera' | 'microphone' | 'both'): Promise<boolean> => {
  try {
    console.log(`Verificando permisos de ${type}...`);
    const constraints: MediaStreamConstraints = {};
    
    if (type === 'camera' || type === 'both') {
      constraints.video = true;
    }
    
    if (type === 'microphone' || type === 'both') {
      constraints.audio = true;
    }

    // Intentamos obtener un stream - si funciona, tenemos permisos
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    // Detenemos el stream después de verificar
    stopMediaStream(stream);
    console.log(`Permisos de ${type} verificados: OK`);
    return true;
  } catch (error) {
    console.log(`Permisos de ${type} verificados: NO DISPONIBLES`);
    return false;
  }
};

// Simplificamos esta función para solicitar permisos
export const requestMediaPermissions = async (
  type: 'camera' | 'microphone' | 'both',
  onPermissionRequested: (showDialog: boolean) => void
): Promise<boolean> => {
  try {
    // Verificamos permisos actuales
    const hasPermissions = await checkMediaPermissions(type);
    
    if (hasPermissions) {
      console.log(`Ya se tienen permisos de ${type}`);
      return true;
    }
    
    // Si no tenemos permisos, mostramos el diálogo
    console.log(`Se requieren permisos de ${type}, mostrando diálogo`);
    onPermissionRequested(true);
    
    // La función retorna false porque el resultado real dependerá 
    // de la interacción del usuario con el diálogo
    return false;
  } catch (error) {
    console.error(`Error al solicitar permisos de ${type}:`, error);
    return false;
  }
};
