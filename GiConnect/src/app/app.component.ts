import { Component, OnInit, HostListener, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Platform, IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  menu, 
  personOutline,
  logInOutline, 
  powerOutline,
  homeOutline,
  timeOutline,
  newspaperOutline,
  chatbubbleOutline,
  cartOutline,
  logOutOutline,
  medalOutline,
  calendarOutline,
  cardOutline
} from 'ionicons/icons';
import { App } from '@capacitor/app';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    IonicModule,
    RouterOutlet,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  isMenuOpen = false;
  userName: string | null = null;
  userPhoto: string | null = null;
  userBeltColor: string | null = null;
  isAndroid = false;
  isAdminOrMaestro = false;
  private storageListener: any;
  private overlay: HTMLElement | null = null;
  
  constructor(
    private router: Router,
    private platform: Platform,
    private authService: AuthService
  ) {
    this.isAndroid = this.platform.is('android');
  }

  ngOnInit() {
    this.createOverlay();
    this.checkUserStatus();
    // Escuchar cambios en el localStorage
    this.storageListener = window.addEventListener('storage', (event) => {
      if (event.key === 'user') {
        this.checkUserStatus();
      }
    });
  }

  ngOnDestroy() {
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
    }
    this.removeOverlay();
  }

  ngAfterViewInit() {
    addIcons({
      menu, 
      personOutline,
      logInOutline, 
      powerOutline,
      homeOutline,
      timeOutline,
      newspaperOutline,
      chatbubbleOutline,
      cartOutline,
      logOutOutline,
      medalOutline,
      calendarOutline,
      cardOutline
    });
  }

  private createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.style.position = 'fixed';
    this.overlay.style.top = '0';
    this.overlay.style.left = '0';
    this.overlay.style.width = '100%';
    this.overlay.style.height = '100%';
    this.overlay.style.zIndex = '999';
    this.overlay.style.display = 'none';
    document.body.appendChild(this.overlay);
  }

  private removeOverlay() {
    if (this.overlay) {
      document.body.removeChild(this.overlay);
      this.overlay = null;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      this.checkUserStatus();
      if (this.overlay) {
        this.overlay.style.display = 'block';
        this.overlay.addEventListener('click', this.handleOverlayClick.bind(this));
      }
    } else {
      if (this.overlay) {
        this.overlay.style.display = 'none';
        this.overlay.removeEventListener('click', this.handleOverlayClick.bind(this));
      }
    }
  }

  private handleOverlayClick(event: MouseEvent) {
    const menuContent = document.querySelector('.menu-content');
    if (menuContent && !menuContent.contains(event.target as Node)) {
      this.isMenuOpen = false;
      if (this.overlay) {
        this.overlay.style.display = 'none';
      }
    }
  }

  checkUserStatus() {
    const userInfo = localStorage.getItem('user');
    console.log('Checking user status:', userInfo); // Para debugging
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        console.log('Parsed user:', user); // Para debugging
        this.userName = user.nombre ? `${user.nombre} ${user.apellido1}` : null;
        this.userPhoto = user.foto || null;
        this.userBeltColor = user.cinturon || null;
        this.isAdminOrMaestro = user.role === 'admin' || user.role === 'maestro';
        console.log('Updated user info:', { 
          name: this.userName, 
          photo: this.userPhoto, 
          belt: this.userBeltColor,
          isAdminOrMaestro: this.isAdminOrMaestro 
        }); // Para debugging
      } catch (error) {
        console.error('Error parsing user info:', error);
        this.resetUserInfo();
      }
    } else {
      this.resetUserInfo();
    }
  }

  private resetUserInfo() {
    this.userName = null;
    this.userPhoto = null;
    this.userBeltColor = null;
    this.isAdminOrMaestro = false;
  }

  navigateToLogin() {
    this.router.navigateByUrl('/auth/login');
    this.isMenuOpen = false;
  }

  navigateTo(path: string) {
    this.router.navigateByUrl(path);
    this.isMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.resetUserInfo();
    this.router.navigateByUrl('/auth/login');
    this.isMenuOpen = false;
  }

  async exitApp() {
    await App.exitApp();
  }
}
