import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bridge.game',
  appName: 'BridgeGame',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      overlaysWebView: false
    }
  }
};

export default config;
