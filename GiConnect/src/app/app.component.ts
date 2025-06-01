import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  eyeOutline, 
  eyeOffOutline, 
  cameraOutline,
  personOutline,
  lockClosedOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    IonicModule,
    RouterOutlet
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
      this.router.navigateByUrl('/auth/login', { replaceUrl: true });
    }
  }

  ngAfterViewInit() {
    addIcons({
      eyeOutline,
      eyeOffOutline,
      cameraOutline,
      personOutline,
      lockClosedOutline
    });
  }
}
