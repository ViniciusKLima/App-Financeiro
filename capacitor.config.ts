const config = {
  appId: 'io.ionic.starter',
  appName: 'controle-financeiro',
  webDir: 'www',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0, // ✅ Remove splash nativo imediatamente
      launchAutoHide: true,
      launchFadeOutDuration: 0,
      backgroundColor: '#1b57be', // ✅ Só para o splash
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1b57be', // ✅ Só para o splash
      overlay: false,
    },
  },
};

export default config;
