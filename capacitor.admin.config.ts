import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.joestreet.admin',
  appName: 'Joe Street Admin',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#FAF5EF',
    path: 'android-admin',
  },
};

export default config;
