
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
