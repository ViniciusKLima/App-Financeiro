import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.viniciuskaua.financeiro',
  appName: 'Controle Financeiro',
  webDir: 'www',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#1b57be',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT', // ✅ FORÇA ícones pretos
      backgroundColor: '#e4eef0',
      overlaysWebView: false, // ✅ FORÇA não sobrepor
    },
  },
};

export default config;
