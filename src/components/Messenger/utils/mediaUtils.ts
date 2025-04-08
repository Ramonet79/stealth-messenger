
// Format recording time (seconds to MM:SS)
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Function to stop media stream tracks
export const stopMediaStream = (stream: MediaStream | null): void => {
  if (stream) {
    console.log("Deteniendo stream de medios...");
    try {
      const tracks = stream.getTracks();
      tracks.forEach(track => {
        try {
          track.stop();
          console.log(`Track ${track.kind} detenido correctamente`);
        } catch (e) {
          console.error(`Error al detener track ${track.kind}:`, e);
        }
      });
    } catch (e) {
      console.error("Error al detener stream de medios:", e);
    }
  } else {
    console.log("No hay stream para detener");
  }
};

// Función mejorada para verificar si los permisos de media están disponibles
export const checkMediaPermissions = async (type: 'camera' | 'microphone' | 'both'): Promise<boolean> => {
  try {
    console.log(`Verificando permisos de ${type}...`);
    let constraints: MediaStreamConstraints = {};
    
    if (type === 'camera' || type === 'both') {
      constraints.video = true;
    }
    
    if (type === 'microphone' || type === 'both') {
      constraints.audio = true;
    }

    // Usar un timeout para evitar que la promesa quede pendiente indefinidamente
    const permissionPromise = navigator.mediaDevices.getUserMedia(constraints);
    const timeoutPromise = new Promise<MediaStream>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout checking permissions')), 5000);
    });
    
    // Intentamos obtener un stream - si funciona, tenemos permisos
    const stream = await Promise.race([permissionPromise, timeoutPromise]);
    console.log(`Permisos de ${type} verificados correctamente`);
    
    // Importante: detener el stream después de verificar
    stopMediaStream(stream);
    return true;
  } catch (error) {
    console.error(`Error al verificar permisos de ${type}:`, error);
    return false;
  }
};

// Función que muestra un diálogo personalizado para solicitar permisos
export const requestMediaPermissions = async (
  type: 'camera' | 'microphone' | 'both',
  onPermissionRequested: (showDialog: boolean) => void
): Promise<boolean> => {
  try {
    // Primero verificamos si ya tenemos permisos
    const hasPermissions = await checkMediaPermissions(type);
    
    if (hasPermissions) {
      console.log(`Ya se tienen permisos de ${type}, no es necesario solicitarlos`);
      return true;
    }
    
    // Si no tenemos permisos, mostramos el diálogo personalizado
    console.log(`Se requieren permisos de ${type}, mostrando diálogo personalizado`);
    onPermissionRequested(true);
    
    // La función retorna false porque el resultado real dependerá de la interacción del usuario
    // con el diálogo personalizado. El componente que maneje el diálogo deberá gestionar el resultado.
    return false;
  } catch (error) {
    console.error(`Error al solicitar permisos de ${type}:`, error);
    return false;
  }
};
