// ─────────────────────────────────────────────────────────────────────────────
// CAPACITOR CONFIG
// Bundle ID matches Apple Developer + Google Play registration.
// ─────────────────────────────────────────────────────────────────────────────

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId:   'app.marketerpro.office',
  appName: 'Marketer-Pro',
  webDir:  'dist',

  server: {
    androidScheme: 'https',
    // During development on a physical device, uncomment and set your
    // local machine IP:
    // url: 'http://192.168.1.X:5173',
    // cleartext: true,
  },

  plugins: {
    StatusBar: {
      style:           'DARK',
      backgroundColor: '#060912',
      overlaysWebView: false,
    },
    Keyboard: {
      resize:              'body',
      resizeOnFullScreen:  true,
    },
    SplashScreen: {
      launchAutoHide:      true,
      launchShowDuration:  0,       // Our LoadingScreen replaces native splash
      backgroundColor:    '#060912',
      androidSplashResourceName: 'splash',
      iosSplashResourceName:     'Splash',
      showSpinner:         false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },

  ios: {
    contentInset: 'automatic',
    backgroundColor: '#060912',
    allowsLinkPreview: false,
    scrollEnabled: false,           // Managed by our Container component
  },

  android: {
    backgroundColor:    '#060912',
    allowMixedContent:  false,
    loggingBehavior:    'debug',
    webContentsDebuggingEnabled: true, // Set false for production builds
  },
};

export default config;
