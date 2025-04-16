
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
    }>;
  }
}
