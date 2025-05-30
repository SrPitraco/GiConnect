import { Routes } from '@angular/router';
import { LoginPage } from './auth/login/login.page';
import { RegisterPage } from './auth/register/register.page';
import { ListPage } from './clases/list/list.page';
import { DashboardPage } from './maestro/dashboard/dashboard.page';
import { HomePage } from './home/home.page';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: LoginPage
  },

  {
    path: 'register',
    component: RegisterPage
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
  }
];
