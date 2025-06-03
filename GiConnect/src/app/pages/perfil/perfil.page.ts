import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { createOutline, cameraOutline, saveOutline } from 'ionicons/icons';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AlertController } from '@ionic/angular';

interface UserData {
  nombre: string;
  apellido1: string;
  apellido2: string;
  email: string;
  telefono: string;
  dni: string;
  numIBJJF: string;
  fechaInicio: string | null;
  cinturon: string;
  grado: string;
  fechaDesde: string | null;
  clasesAsistidas: number;
  clasesImpartidas: number;
  role: string;
  foto: string | null;
}

interface Subscription {
  tipo: string;
  fechaFin: string;
}

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ]
})
export class PerfilPage implements OnInit {
  userData: UserData = {
    nombre: '',
    apellido1: '',
    apellido2: '',
    email: '',
    telefono: '',
    dni: '',
    numIBJJF: '',
    fechaInicio: null,
    cinturon: '',
    grado: '',
    fechaDesde: null,
    clasesAsistidas: 0,
    clasesImpartidas: 0,
    role: '',
    foto: null
  };

  userName: string = '';
  userRole: string = '';
  userPhoto: string | null = null;
  activeSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private alertController: AlertController
  ) {
    addIcons({ createOutline, cameraOutline, saveOutline });
  }

  ngOnInit() {
    this.loadUserData();
    this.loadSubscription();
  }

  loadUserData() {
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        console.log('Usuario cargado:', user); // Para debug
        this.userData = {
          ...this.userData,
          ...user,
          fechaInicio: user.fechaInicio || null,
          fechaDesde: user.fechaDesde || null
        };
        this.userName = `${user.nombre} ${user.apellido1}`;
        this.userRole = this.getRoleName(user.role);
        this.userPhoto = user.foto || null;
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    }
  }

  loadSubscription() {
    // TODO: Implementar la carga de suscripciones desde el backend
    // Por ahora, simulamos una suscripción activa
    this.activeSubscription = {
      tipo: 'Mensual',
      fechaFin: '2024-12-31'
    };
  }

  isSubscriptionExpired(): boolean {
    if (!this.activeSubscription) return true;
    const fechaFin = new Date(this.activeSubscription.fechaFin);
    const hoy = new Date();
    return fechaFin < hoy;
  }

  getRoleName(role: string): string {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'maestro':
        return 'Maestro';
      case 'alumno':
        return 'Alumno';
      default:
        return 'Usuario';
    }
  }

  async updateField(field: keyof UserData) {
    try {
      // TODO: Implementar la actualización en el backend
      console.log(`Actualizando campo ${field}:`, this.userData[field]);
      // Aquí iría la llamada al servicio para actualizar el campo
    } catch (error) {
      console.error('Error al actualizar el campo:', error);
    }
  }

  async changePhoto() {
    // TODO: Implementar la funcionalidad de cambio de foto
    console.log('Cambiar foto');
  }

  async saveChanges() {
    try {
      const userInfo = localStorage.getItem('user');
      if (!userInfo) {
        throw new Error('No hay usuario registrado');
      }

      const user = JSON.parse(userInfo);
      console.log('Usuario a actualizar:', user); // Para debug
      const token = localStorage.getItem('token');

      if (!user._id) { // Cambiado de user.id a user._id
        throw new Error('ID de usuario no encontrado');
      }

      if (!token) {
        throw new Error('Token de autorización no encontrado');
      }

      // Configurar headers con el token
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      
      // Actualizar en la base de datos
      const response = await this.http.put(
        `${environment.apiUrl}/users/${user._id}`, // Cambiado de user.id a user._id
        this.userData,
        { headers }
      ).toPromise();
      
      if (response) {
        // Actualizar localStorage con los nuevos datos
        const updatedUser = { ...user, ...this.userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Actualizar las variables locales
        this.userName = `${this.userData.nombre} ${this.userData.apellido1}`;
        this.userRole = this.getRoleName(this.userData.role);
        
        // Mostrar alerta de éxito
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'Los cambios se han guardado correctamente',
          buttons: [
            {
              text: 'OK',
              handler: () => {
                this.router.navigate(['/home']);
              }
            }
          ]
        });

        await alert.present();
      }
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      // Mostrar alerta de error
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Ha ocurrido un error al guardar los cambios. Por favor, inténtalo de nuevo.',
        buttons: ['OK']
      });

      await alert.present();
    }
  }
} 