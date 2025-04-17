
/**
 * Definición centralizada de la interfaz MediaCapturePlugin
 * Esta interfaz define las operaciones disponibles para captura de medios en dispositivos móviles
 */
export interface MediaCapturePlugin {
  captureVideo: (
    success: (mediaFiles: any[]) => void,
    error: (error: any) => void,
    options?: { limit?: number; duration?: number; quality?: number }
  ) => void;
  captureImage: (
    success: (mediaFiles: any[]) => void,
    error: (error: any) => void,
    options?: { limit?: number; duration?: number; quality?: number }
  ) => void;
}
