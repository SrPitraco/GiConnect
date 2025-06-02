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
  medalOutline
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

  constructor(
    private router: Router,
    private platform: Platform,
    private authService: AuthService
  ) {
    this.isAndroid = this.platform.is('android');
  }

  ngOnInit() {
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
      medalOutline
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const menuButton = document.querySelector('.menu-button');
    const menuContent = document.querySelector('.menu-content');
    
    if (menuButton && !menuButton.contains(event.target as Node) &&
        menuContent && !menuContent.contains(event.target as Node)) {
      this.isMenuOpen = false;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      this.checkUserStatus();
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
