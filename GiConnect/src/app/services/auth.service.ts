import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthResponse {
  token: string;
  user: {
    _id: string;
    email: string;
    nombre: string;
    apellido1: string;
    apellido2?: string;
    role: string;
    [key: string]: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  async login(credentials: { email: string; password: string }) {
    try {
      console.log('📝 Intentando login con:', credentials);
      console.log('🌐 URL:', `${this.apiUrl}/auth/login`);
      
      if (!credentials.email || !credentials.password) {
        throw new Error('Por favor, completa todos los campos');
      }

      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      console.log('📤 Headers:', headers);

      const response = await firstValueFrom(
        this.http.post<AuthResponse>(
          `${this.apiUrl}/auth/login`,
          credentials,
          { headers }
        )
      );

      console.log('📥 Respuesta del servidor:', response);

      if (response && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return response;
      } else {
        throw new Error('Respuesta del servidor inválida');
      }
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      if (error instanceof HttpErrorResponse) {
        console.error('Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          url: error.url,
          headers: error.headers
        });
        if (error.status === 401) {
          throw new Error('Credenciales inválidas');
        } else if (error.status === 400) {
          throw new Error(error.error?.error || 'Datos de entrada inválidos');
        }
      }
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async register(userData: any) {
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
      );
      if (response && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return response;
      }
      throw new Error('Error en el registro');
    } catch (error: any) {
      throw new Error(error.error?.message || 'Error en el registro');
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

