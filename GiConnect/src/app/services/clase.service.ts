import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface ConfirmarAsistenciaData {
  reservas: {
    reservaId: string;
    status: string;
    asistenciaConfirmada: boolean;
  }[];
  supervisada: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClaseService {
  private apiUrl = `${environment.apiUrl}/clases`;

  constructor(private http: HttpClient) { }

  getClasesParaPasarLista(): Observable<any> {
    return this.http.get(`${this.apiUrl}/para-pasar-lista`);
  }

  confirmarAsistencia(claseId: string, data: ConfirmarAsistenciaData): Observable<any> {
    return this.http.post(`${this.apiUrl}/${claseId}/confirmar-asistencia`, data);
  }
} 