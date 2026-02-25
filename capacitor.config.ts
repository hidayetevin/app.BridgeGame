import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.evnlabs.bridgemaster',
  appName: 'Bridge Master',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      overlaysWebView: false
    }
  }
};

export default config;
