// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000/api',
  allowedOrigins: [
    'http://localhost',
    'http://localhost:8100',
    'http://localhost:4200',
    'capacitor://localhost',
    'http://192.168.1.252:8100',
    'http://192.168.1.252:4200',
    'http://10.0.2.2:4000'
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
