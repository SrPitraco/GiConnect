// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// Función para obtener la IP correcta según el entorno
function getApiUrl() {
  // Si estamos en el emulador de Android
  if (window.location.hostname === '10.0.2.2') {
    return 'http://10.0.2.2:4000/api';
  }
  // Si estamos en el emulador de iOS
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:4000/api';
  }
  // Para dispositivos físicos, usar la IP de la máquina
  return 'http://192.168.1.252:4000/api';
}

export const environment = {
  production: false,
  apiUrl: getApiUrl(),
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
  ]
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
