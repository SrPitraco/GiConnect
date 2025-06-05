import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  calendar,
  globe,
  chatbubbleOutline,
  cartOutline,
  cardOutline,
  personOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

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
  isAdminOrMaestro = false;

  constructor(private router: Router, private authService: AuthService) {
    addIcons({ 
      calendar,
      globe,
      chatbubbleOutline,
      cartOutline,
      cardOutline,
      personOutline
    });
  }

  ngOnInit() {
    this.checkUserRole();
  }

  private checkUserRole() {
    const user = this.authService.getUser();
    this.isAdminOrMaestro = user?.role === 'admin' || user?.role === 'maestro';
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
