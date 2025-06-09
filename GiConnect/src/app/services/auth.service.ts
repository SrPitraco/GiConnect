import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { Platform } from '@ionic/angular';

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
  private apiUrl: string;
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private platform: Platform
  ) {
    this.apiUrl = environment.apiUrl;
    console.log('🌐 URL base configurada:', this.apiUrl);
    // Inicializar el estado del usuario
    this.checkStoredUser();
  }

  private checkStoredUser() {
    const user = localStorage.getItem('user');
    if (user) {
      this.userSubject.next(JSON.parse(user));
    }
  }

  async login(credentials: { email: string; password: string }) {
    try {
      console.log('📝 Intentando login con:', credentials);
      console.log('🌐 URL completa:', `${this.apiUrl}/auth/login`);
      
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
        this.userSubject.next(response.user);
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
    this.userSubject.next(null);
    // Limpiar el formulario de login
    const loginForm = document.querySelector('app-login form');
    if (loginForm) {
      (loginForm as HTMLFormElement).reset();
    }
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

  async compressImage(base64String: string, maxWidth: number = 600): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64String;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calcular nuevas dimensiones manteniendo la proporción
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo crear el contexto del canvas'));
          return;
        }
        
        // Dibujar la imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Función para comprimir con diferentes calidades hasta alcanzar el tamaño deseado
        const compressWithQuality = (quality: number): string => {
          return canvas.toDataURL('image/jpeg', quality);
        };

        // Intentar diferentes niveles de calidad hasta que la imagen sea lo suficientemente pequeña
        const maxSize = 500 * 1024; // 500KB máximo
        let quality = 0.7;
        let compressedBase64 = compressWithQuality(quality);
        
        // Si la imagen es demasiado grande, reducir la calidad progresivamente
        while (this.getBase64Size(compressedBase64) > maxSize && quality > 0.1) {
          quality -= 0.1;
          compressedBase64 = compressWithQuality(quality);
        }

        // Si aún es demasiado grande, reducir el tamaño
        if (this.getBase64Size(compressedBase64) > maxSize) {
          width = Math.round(width * 0.8);
          height = Math.round(height * 0.8);
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          compressedBase64 = compressWithQuality(0.5);
        }

        console.log('Tamaño final de la imagen:', this.getBase64Size(compressedBase64) / 1024, 'KB');
        resolve(compressedBase64);
      };
      
      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };
    });
  }

  private getBase64Size(base64String: string): number {
    // Eliminar el prefijo de la cadena base64
    const base64 = base64String.split(',')[1];
    // Calcular el tamaño aproximado en bytes
    return Math.ceil((base64.length * 3) / 4);
  }
}

