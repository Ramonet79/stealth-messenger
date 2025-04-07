
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
    allowMixedContent: true
  },
  ios: {
    limitsNavigationsToAppBoundDomains: true
  },
  plugins: {
    LiveReload: {
      enabled: true
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
