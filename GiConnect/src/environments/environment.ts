// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { Platform } from '@ionic/angular';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

// Función para determinar la URL base según la plataforma
function getBaseUrl() {
  // Detectar si estamos en un emulador o dispositivo móvil
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Para emuladores y dispositivos móviles, usar la IP real de la máquina
    return 'https://giconnect-production.up.railway.app/api';
  }
  // Para web, usar la URL de producción
  return 'https://giconnect-production.up.railway.app/api';
}

export const environment = {
  production: false,
  apiUrl: getBaseUrl(),
  allowedOrigins: [
    'http://localhost',
    'http://localhost:8100',
    'http://localhost:4200',
    'capacitor://localhost',
    'http://192.168.1.252:8100',
    'http://192.168.1.252:4200',
    'http://192.168.1.252:4000',
    'http://10.0.2.2:4000',
    'http://10.0.2.2:8100',
    'http://10.0.2.2:4200'
  ],
  firebaseConfig: {
    apiKey: "AIzaSyCA1l-x6AhsovfkRi68jH6G_BP9S9UZtXU",
    authDomain: "giconnect-36d94.firebaseapp.com",
    databaseURL: "https://giconnect-36d94-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "giconnect-36d94",
    storageBucket: "giconnect-36d94.firebasestorage.app",
    messagingSenderId: "428486646092",
    appId: "1:428486646092:web:edaeba3e24cb0ce82657e9",
    measurementId: "G-1FX12BTWVW"
  } as FirebaseConfig
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
