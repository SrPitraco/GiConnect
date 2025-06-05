import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Suscripcion, NuevaSuscripcion } from '../interfaces/suscripcion.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SuscripcionService {
  private apiUrl = `${environment.apiUrl}/suscripciones`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getSuscripcionesActivas(): Observable<Suscripcion[]> {
    return this.http.get<Suscripcion[]>(`${this.apiUrl}/activas`, { headers: this.getHeaders() });
  }

  createSuscripcion(suscripcion: NuevaSuscripcion): Observable<Suscripcion> {
    console.log('URL de la API:', this.apiUrl);
    console.log('Datos de la suscripción a crear:', suscripcion);
    console.log('Token:', this.authService.getToken());
    
    return this.http.post<Suscripcion>(this.apiUrl, suscripcion, { headers: this.getHeaders() }).pipe(
      tap(response => {
        console.log('Respuesta del servidor:', response);
      }),
      catchError(error => {
        console.error('Error completo:', error);
        console.error('Mensaje de error:', error.error?.message);
        console.error('Estado del error:', error.status);
        throw error;
      })
    );
  }

  marcarComoPagada(id: string): Observable<Suscripcion> {
    return this.http.patch<Suscripcion>(`${this.apiUrl}/${id}/pagar`, {}, { headers: this.getHeaders() });
  }
} 