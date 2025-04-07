
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ca70e353ea8f4f748cd44e57c75305d7',
  appName: 'dScrt',
  webDir: 'dist',
  // Removemos cualquier configuración de server para usar la versión empaquetada
  // en lugar de intentar cargar una URL remota
  android: {
    allowMixedContent: true
  },
  ios: {
    limitsNavigationsToAppBoundDomains: true
  }
};

export default config;
