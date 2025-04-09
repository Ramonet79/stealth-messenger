
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ca70e353ea8f4f748cd44e57c75305d7',
  appName: 'dScrt',
  webDir: 'dist',
  server: {
    url: 'https://ca70e353ea8f4f748cd44e57c75305d7.lovable.dev',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
    permissions: [
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
      "android.permission.MODIFY_AUDIO_SETTINGS",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.READ_MEDIA_IMAGES",
      "android.permission.READ_MEDIA_VIDEO",
      "android.permission.READ_MEDIA_AUDIO"
    ]
  },
  ios: {
    limitsNavigationsToAppBoundDomains: true,
    webContentsDebuggingEnabled: true
  },
  plugins: {
    LiveReload: {
      enabled: true
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    Camera: {
      cameraUsageDescription: "Esta aplicación necesita acceso a la cámara para enviar fotos y videos",
      microphoneUsageDescription: "Esta aplicación necesita acceso al micrófono para enviar audios y videos con sonido",
      permissions: ["camera", "photos"]
    },
    Permissions: {
      permissions: [
        "camera",
        "microphone",
        "photos",
        "media"
      ]
    }
  }
};

export default config;
