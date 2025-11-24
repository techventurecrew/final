import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Allow optional local HTTPS by placing certs in ./certs/dev-cert.pem and ./certs/dev-key.pem
const certDir = path.resolve(__dirname, 'certs');
const certFile = path.join(certDir, 'dev-cert.pem');
const keyFile = path.join(certDir, 'dev-key.pem');
let httpsOption = false;

try {
  if (fs.existsSync(certFile) && fs.existsSync(keyFile)) {
    httpsOption = {
      cert: fs.readFileSync(certFile),
      key: fs.readFileSync(keyFile),
    };
    console.log('Using local HTTPS certs from', certDir);
  }
} catch (e) {
  // ignore and run without https
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    https: httpsOption || false,
  },
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
