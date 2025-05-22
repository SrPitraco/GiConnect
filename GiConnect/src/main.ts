import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { provideRouter } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(IonicModule.forRoot()),
    importProvidersFrom(HttpClientModule),
    provideRouter(routes)
  ]
}).catch(err => console.error(err));
