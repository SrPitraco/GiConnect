import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  calendar,
  globe,
  chatbubbleOutline,
  cartOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class HomePage implements OnInit {
  userName: string = '';
  isAdminOrMaestro: boolean = false;

  constructor(private router: Router) {
    addIcons({ 
      calendar,
      globe,
      chatbubbleOutline,
      cartOutline
    });
  }

  ngOnInit() {
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        this.userName = user.nombre;
        this.isAdminOrMaestro = user.role === 'admin' || user.role === 'maestro';
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    }
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
