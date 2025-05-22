import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

interface LoginResp {
  token: string;
  user: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API = 'http://localhost:4000/api/auth';

  constructor(private http: HttpClient) {}

  register(data: {
    email: string;
    password: string;
    nombre: string;
    apellido1: string;
    apellido2?: string;
    dni?: string;
    telefono: string;
    foto: string;
  }) {
    return this.http.post<LoginResp>(`${this.API}/register`, data)
      .pipe(tap(res => this.store(res)));
  }

  login(creds: { email: string; password: string }) {
    return this.http.post<LoginResp>(`${this.API}/login`, creds)
      .pipe(tap(res => this.store(res)));
  }

  private store(res: LoginResp) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUser(): any {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }
}
