import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'list',
    loadComponent: () => import('./clases/list/list.page').then( m => m.ListPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./maestro/dashboard/dashboard.page').then( m => m.DashboardPage)
  },
];
