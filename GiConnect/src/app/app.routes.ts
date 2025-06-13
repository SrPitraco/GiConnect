import { Routes } from '@angular/router';
import { LoginPage } from './auth/login/login.page';
import { RegisterPage } from './auth/register/register.page';
import { ForgotPasswordPage } from './auth/forgot-password/forgot-password.page';
import { ResetPasswordPage } from './auth/reset-password/reset-password.page';
import { HomePage } from './pages/home/home.page';
import { PruebaPage } from './pages/prueba/prueba.page';
import { PerfilPage } from './pages/perfil/perfil.page';
import { authGuard } from './guards/auth.guard';
import { ReservasPage } from './pages/reservas/reservas.page';
import { SuscripcionesPage } from './pages/suscripciones/suscripciones.page';
import { MestrePortalPage } from './pages/mestre-portal/mestre-portal.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginPage },
      { path: 'register', component: RegisterPage },
      { path: 'forgot-password', component: ForgotPasswordPage },
      { path: 'reset-password', component: ResetPasswordPage },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  {
    path: 'home',
    component: HomePage,
    canActivate: [authGuard]
  },

  {
    path: 'mestre-portal',
    component: MestrePortalPage,
    canActivate: [authGuard]
  },

  {
    path: 'prueba',
    component: PruebaPage,
    canActivate: [authGuard]
  },
  
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then(m => m.PerfilPage),
    canActivate: [authGuard]
  },

  {
    path: 'reservas',
    component: ReservasPage,
    canActivate: [authGuard]
  },

  {
    path: 'suscripciones',
    component: SuscripcionesPage,
    canActivate: [authGuard]
  },
  {
    path: 'teacher',
    children: [
      {
        path: 'attendance',
        loadComponent: () => import('./pages/pasar-lista/pasar-lista.page').then(m => m.PasarListaPage),
        canActivate: [authGuard]
      }
    ]
  }
];
