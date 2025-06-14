import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { provideRouter } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { environment } from './environments/environment';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

if (environment.production) {
  enableProdMode();
}

// Initialize Firebase
const app = initializeApp(environment.firebaseConfig);
const database = getDatabase(app);

bootstrapApplication(AppComponent, {
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideRouter(routes),
    importProvidersFrom(IonicModule.forRoot()),
    importProvidersFrom(HttpClientModule)
  ]
}).catch(err => console.error(err));
