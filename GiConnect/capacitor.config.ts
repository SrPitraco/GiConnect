import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'GiConnect',
  webDir: 'www',
  server: {
    androidScheme: 'http',
    cleartext: true,
    allowNavigation: [
      'http://10.0.2.2:4000',
      'http://localhost:4000',
      'http://192.168.1.252:4000',
      'http://localhost:8100',
      'http://192.168.1.252:8100'
    ]
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  ios: {
    allowsLinkPreview: true
  }
};

export default config;
