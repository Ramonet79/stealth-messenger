
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ca70e353ea8f4f748cd44e57c75305d7',
  appName: 'stealth-messenger',
  webDir: 'dist',
  server: {
    url: 'https://ca70e353-ea8f-4f74-8cd4-4e57c75305d7.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  // Add permissions for camera, microphone, etc. if needed
  android: {
    allowMixedContent: true
  },
  ios: {
    limitsNavigationsToAppBoundDomains: true
  }
};

export default config;
