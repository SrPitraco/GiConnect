import { Component, OnInit } from '@angular/core';
import {
  IonApp,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    IonTitle, 
    IonApp,
    IonHeader,
    IonToolbar,
    IonContent,
    IonRouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  
  constructor (
    private auth: AuthService,
    private router: Router
  ){}

  ngOnInit() {
      if(this.auth.isLoggedIn()) {
        this.router.navigateByUrl('/home', { replaceUrl: true });
      }
      else {
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }
  }


}
