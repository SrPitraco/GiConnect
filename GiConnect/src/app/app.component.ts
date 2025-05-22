import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, IonHeader, IonToolbar, IonTitle],
})
export class AppComponent {
  constructor() {}
}