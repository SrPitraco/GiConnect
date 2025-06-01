import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

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
      console.log('📝 Intentando registro con:', userData);
      console.log('🌐 URL:', `${this.apiUrl}/auth/register`);

      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      console.log('📤 Headers:', headers);
      console.log('📦 Datos a enviar:', JSON.stringify(userData, null, 2));

      const response = await firstValueFrom(
        this.http.post<AuthResponse>(
          `${this.apiUrl}/auth/register`,
          userData,
          { headers }
        )
      );

      console.log('📥 Respuesta del servidor:', response);

      if (response && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return response;
      }
      throw new Error('Error en el registro');
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      if (error instanceof HttpErrorResponse) {
        console.error('Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          url: error.url,
          headers: error.headers
        });
        
        if (error.status === 400) {
          const errorMessage = error.error?.error || error.error?.message || '';
          console.log('Mensaje de error recibido:', errorMessage);
          console.log('Error completo:', JSON.stringify(error.error, null, 2));
          
          if (error.error?.errors) {
            const validationErrors = error.error.errors;
            const errorMessages = Object.values(validationErrors).map((err: any) => err.message);
            throw new Error(errorMessages.join(', '));
          }
          
          if (errorMessage.toLowerCase().includes('dni')) {
            throw new Error('Ya existe un usuario con este DNI');
          } else if (errorMessage.toLowerCase().includes('telefono')) {
            throw new Error('Ya existe un usuario con este teléfono');
          } else if (errorMessage.toLowerCase().includes('email')) {
            throw new Error('Ya existe un usuario con este email');
          }
          throw new Error(errorMessage || 'Datos de entrada inválidos');
        }
      }
      throw new Error(error.message || 'Error en el registro');
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

  // Solicitar recuperación de contraseña
  requestPasswordReset(email: string): Observable<any> {
    console.log('🌐 URL de recuperación:', `${this.apiUrl}/auth/request-password-reset`);
    return this.http.post(`${this.apiUrl}/auth/request-password-reset`, { email });
  }

  // Verificar código y actualizar contraseña
  resetPassword(email: string, code: string, newPassword: string): Observable<any> {
    console.log('🌐 URL de reset:', `${this.apiUrl}/auth/reset-password`);
    return this.http.post(`${this.apiUrl}/auth/reset-password`, {
      email,
      code,
      newPassword
    });
  }
}

