import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  
  // Load Firebase config if it exists
  let firebaseConfig = {};
  const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    try {
      firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {
      console.warn('Failed to parse firebase-applet-config.json');
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.FIREBASE_CONFIG': JSON.stringify({
        apiKey: env.VITE_FIREBASE_API_KEY || (firebaseConfig as any).apiKey,
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || (firebaseConfig as any).authDomain,
        projectId: env.VITE_FIREBASE_PROJECT_ID || (firebaseConfig as any).projectId,
        appId: env.VITE_FIREBASE_APP_ID || (firebaseConfig as any).appId,
        firestoreDatabaseId: env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || (firebaseConfig as any).firestoreDatabaseId,
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || (firebaseConfig as any).storageBucket,
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || (firebaseConfig as any).messagingSenderId,
      }),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
