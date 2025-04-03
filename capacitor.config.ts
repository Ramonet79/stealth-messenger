
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ca70e353ea8f4f748cd44e57c75305d7',
  appName: 'stealth-messenger',
  webDir: 'dist',
  // Cambiamos la configuración para usar la versión empaquetada local
  // en lugar de intentar cargar la URL remota que no está disponible
  // server: {
  //   url: 'https://ca70e353-ea8f-4f74-8cd4-4e57c75305d7.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  android: {
    allowMixedContent: true
  },
  ios: {
    limitsNavigationsToAppBoundDomains: true
  }
};

export default config;
