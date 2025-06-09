import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (token && user) {
    // Si hay token y usuario, permitir el acceso
    return true;
  } else {
    // Si no hay token o usuario, redirigir a login
    router.navigate(['/auth/login']);
    return false;
  }
};
