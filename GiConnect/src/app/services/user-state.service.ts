import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private userState = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {
    // Inicializar el estado
    this.updateUserState();
    
    // Suscribirse a los cambios en el localStorage
    window.addEventListener('storage', (event) => {
      if (event.key === 'user' || event.key === 'token') {
        this.updateUserState();
      }
    });
  }

  private updateUserState() {
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getUser();
      this.userState.next(user);
    } else {
      this.userState.next(null);
    }
  }

  getUserState(): Observable<any> {
    return this.userState.asObservable();
  }

  getCurrentUser() {
    return this.userState.value;
  }
} 