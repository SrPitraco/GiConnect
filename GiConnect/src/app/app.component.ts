import { Component, OnInit, HostListener, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
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
  cardOutline,
  checkboxOutline,
  calendarNumberOutline,
  createOutline,
  bagAddOutline
} from 'ionicons/icons';
import { App } from '@capacitor/app';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

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
  private userSubscription: any;
  private routerSubscription: any;
  
  constructor(
    private router: Router,
    private platform: Platform,
    private authService: AuthService,
    private el: ElementRef
  ) {
    this.isAndroid = this.platform.is('android');
  }

  ngOnInit() {
    this.checkUserRole();
    this.setupRouterListener();
  }

  private setupRouterListener() {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Si estamos en la página de reservas, recargamos los datos
      if (event.url === '/reservas') {
        // Emitimos un evento personalizado que la página de reservas escuchará
        window.dispatchEvent(new CustomEvent('reloadReservas'));
      }
    });
  }

  private checkUserRole() {
    this.userSubscription = this.authService.user$.subscribe(user => {
      console.log('Usuario actualizado:', user);
      if (user) {
        this.userName = user.nombre ? `${user.nombre} ${user.apellido1}` : null;
        this.userPhoto = user.foto || null;
        this.userBeltColor = user.cinturon || null;
        this.isAdminOrMaestro = user.role === 'admin' || user.role === 'maestro';
        console.log('Información del menú actualizada:', {
          name: this.userName,
          photo: this.userPhoto,
          belt: this.userBeltColor,
          isAdminOrMaestro: this.isAdminOrMaestro
        });
      } else {
        this.resetUserInfo();
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
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
      medalOutline,
      calendarOutline,
      cardOutline,
      checkboxOutline,
      calendarNumberOutline,
      createOutline,
      bagAddOutline
    });
  }

  private resetUserInfo() {
    this.userName = null;
    this.userPhoto = null;
    this.userBeltColor = null;
    this.isAdminOrMaestro = false;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement) {
    const menuEl = this.el.nativeElement.querySelector('.menu-content');
    const buttonEl = this.el.nativeElement.querySelector('.menu-button');
    if (
      this.isMenuOpen &&
      menuEl && !menuEl.contains(target) &&
      buttonEl && !buttonEl.contains(target)
    ) {
      this.isMenuOpen = false;
    }
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
    this.router.navigateByUrl('/auth/login');
    this.isMenuOpen = false;
  }

  async exitApp() {
    await App.exitApp();
  }
}
