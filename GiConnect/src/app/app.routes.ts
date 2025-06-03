import { Routes } from '@angular/router';
import { LoginPage } from './auth/login/login.page';
import { RegisterPage } from './auth/register/register.page';
import { ForgotPasswordPage } from './auth/forgot-password/forgot-password.page';
import { ResetPasswordPage } from './auth/reset-password/reset-password.page';
import { ListPage } from './pages/clases/list/list.page';
import { DashboardPage } from './pages/maestro/dashboard/dashboard.page';
import { HomePage } from './pages/home/home.page';
import { PruebaPage } from './pages/prueba/prueba.page';
import { PerfilPage } from './pages/perfil/perfil.page';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
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
    path: 'clases',
    component: ListPage,
    canActivate: [authGuard]
  },
  
  {
    path: 'maestro',
    component: DashboardPage,
    canActivate: [authGuard]
  },

  {
    path: 'prueba',
    component: PruebaPage,
    canActivate: [authGuard]
  },

  {
    path: 'perfil',
    component: PerfilPage,
    canActivate: [authGuard]
  }
];
