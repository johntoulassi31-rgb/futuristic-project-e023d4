import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.plumelibre.mentoratplus',
  appName: 'Mentoratplus',
  webDir: 'dist',
  // Le serveur distant conserve les routes API et le cookie sécurisé existants.
  // L'application nécessite une connexion Internet.
  server: {
    url: 'https://futuristic-project-e023d4.netlify.app',
    cleartext: false,
  },
};

export default config;
