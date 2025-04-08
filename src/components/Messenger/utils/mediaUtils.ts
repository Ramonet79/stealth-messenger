
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

// Función para verificar si los permisos de media están disponibles
export const checkMediaPermissions = async (type: 'camera' | 'microphone' | 'both'): Promise<boolean> => {
  try {
    let constraints: MediaStreamConstraints = {};
    
    if (type === 'camera' || type === 'both') {
      constraints.video = true;
    }
    
    if (type === 'microphone' || type === 'both') {
      constraints.audio = true;
    }
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    stopMediaStream(stream);
    return true;
  } catch (error) {
    console.error(`Error al verificar permisos de ${type}:`, error);
    return false;
  }
};
