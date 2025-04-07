
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ca70e353ea8f4f748cd44e57c75305d7',
  appName: 'dScrt',
  webDir: 'dist',
  // Server configuration removed for production build
  android: {
    allowMixedContent: true
  },
  ios: {
    limitsNavigationsToAppBoundDomains: true
  },
  // Explicitly disable live reload for production
  plugins: {
    LiveReload: {
      enabled: false
    }
  }
};

export default config;
