import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

interface Usuario {
  _id: string;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  email: string;
  role: string;
  foto?: string;
}

@Component({
  selector: 'app-modificar-usuario',
  templateUrl: './modificar-usuario.page.html',
  styleUrls: ['./modificar-usuario.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ]
})
export class ModificarUsuarioPage implements OnInit {
  usuarios: Usuario[] = [];
  loading: boolean = true;
  error: string | null = null;
  currentUserRole: string = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  async loadUsers() {
    try {
      this.loading = true;
      const currentUser = this.authService.getUser();
      this.currentUserRole = currentUser?.role || '';

      const response = await this.http.get<Usuario[]>(
        `${environment.apiUrl}/users`,
        { headers: this.getHeaders() }
      ).toPromise();

      if (response) {
        // Filtrar usuarios según el rol del usuario actual
        this.usuarios = response.filter(user => {
          if (this.currentUserRole === 'admin') {
            return user.role !== 'admin';
          } else if (this.currentUserRole === 'maestro') {
            return user.role !== 'admin' && user.role !== 'maestro';
          }
          return false;
        });
      }
    } catch (error: any) {
      console.error('Error al cargar usuarios:', error);
      this.error = 'Error al cargar la lista de usuarios';
    } finally {
      this.loading = false;
    }
  }

  getRoleName(role: string): string {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'Administrador';
      case 'maestro':
        return 'Maestro';
      case 'instructor':
        return 'Instructor';
      case 'atleta':
        return 'Atleta';
      default:
        return 'Usuario';
    }
  }
} 