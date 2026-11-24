import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.plumelibre.mentoratplus',
  appName: 'Mentoratplus',
  webDir: 'dist',
  // Le frontend est publié sur GitHub Pages ; Supabase fournit Auth, Database et Edge Functions.
  // L'application nécessite une connexion Internet.
  server: {
    url: 'https://johntoulassi31-rgb.github.io/futuristic-project-e023d4/',
    cleartext: false,
  },
};

export default config;
