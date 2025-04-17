
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

// Evitamos la redeclaración de MediaCapturePlugin en este archivo
// Dejamos la definición unificada en useMediaCapture.native.ts
