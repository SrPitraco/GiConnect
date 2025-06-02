import { Routes } from '@angular/router';
import { LoginPage } from './auth/login/login.page';
import { RegisterPage } from './auth/register/register.page';
import { ForgotPasswordPage } from './auth/forgot-password/forgot-password.page';
import { ResetPasswordPage } from './auth/reset-password/reset-password.page';
import { ListPage } from './clases/list/list.page';
import { DashboardPage } from './maestro/dashboard/dashboard.page';
import { HomePage } from './home/home.page';
import { PruebaPage } from './pages/prueba/prueba.page';
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
  }
];
