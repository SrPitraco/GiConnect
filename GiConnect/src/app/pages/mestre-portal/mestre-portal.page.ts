import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mestre-portal',
  templateUrl: './mestre-portal.page.html',
  styleUrls: ['./mestre-portal.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class MestrePortalPage implements OnInit {
  userName: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.nombre || user.email?.split('@')[0] || '';
    }
  }

  menuItems = [
    {
      title: 'Pasar Lista',
      icon: 'list-outline',
      route: '/teacher/attendance'
    },
    {
      title: 'Modificar Usuario',
      icon: 'person-outline',
      route: '/teacher/modify-user'
    },
    {
      title: 'Crear Clase Especial',
      icon: 'add-circle-outline',
      route: '/teacher/special-class'
    },
    {
      title: 'Crear Clase Fija',
      icon: 'calendar-outline',
      route: '/teacher/fixed-class'
    },
    {
      title: 'Modificar Clase',
      icon: 'create-outline',
      route: '/teacher/modify-class'
    },
    {
      title: 'Crear Artículo Tienda',
      icon: 'cart-outline',
      route: '/teacher/create-item'
    }
  ];

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
} 