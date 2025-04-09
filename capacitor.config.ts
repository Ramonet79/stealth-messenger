
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ca70e353ea8f4f748cd44e57c75305d7',
  appName: 'dScrt',
  webDir: 'dist',
  // Desactivamos la conexión al servidor de desarrollo para usar la versión compilada
  // server: {
  //   url: 'https://ca70e353ea8f4f748cd44e57c75305d7.lovable.dev',
  //   cleartext: true
  // },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
    // Expanded and organized permissions list
    permissions: [
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
      "android.permission.MODIFY_AUDIO_SETTINGS",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.READ_MEDIA_IMAGES",
      "android.permission.READ_MEDIA_VIDEO",
      "android.permission.READ_MEDIA_AUDIO",
      "android.permission.ACCESS_NETWORK_STATE",
      "android.permission.POST_NOTIFICATIONS"
    ]
  },
  ios: {
    limitsNavigationsToAppBoundDomains: true,
    webContentsDebuggingEnabled: true
  },
  plugins: {
    LiveReload: {
      enabled: false  // Desactivamos LiveReload para asegurar que se use la versión compilada
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    Camera: {
      cameraUsageDescription: "Esta aplicación necesita acceso a la cámara para enviar fotos y videos",
      microphoneUsageDescription: "Esta aplicación necesita acceso al micrófono para enviar audios y videos con sonido",
      permissions: ["camera", "microphone"],
      // Agregar configuraciones adicionales para mejorar compatibilidad
      presentationStyle: "fullscreen"
    }
  }
};

export default config;
