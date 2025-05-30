import { Component } from '@angular/core';
import {
  IonApp,
  IonHeader,
  IonToolbar,
  IonContent,
  IonRouterOutlet, IonTitle, IonButtons } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonButtons, IonTitle, 
    IonApp,
    IonHeader,
    IonToolbar,
    IonContent,
    IonRouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {}
