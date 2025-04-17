
import { CameraResultType, CameraSource } from '@capacitor/camera';

declare module '@capacitor/camera' {
  interface CameraPlugin {
    pickVideo(options?: {
      quality?: number;
      saveToGallery?: boolean;
    }): Promise<{
      path?: string;
      webPath?: string;
      format?: string;
      saved?: boolean;
      duration?: number;
    }>;
  }
}

// Referenciamos la definición centralizada de MediaCapturePlugin
// La definición real está en src/types/media-capture.ts
