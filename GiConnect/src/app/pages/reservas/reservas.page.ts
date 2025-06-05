import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { calendarOutline, chevronForwardOutline, chevronBackOutline } from 'ionicons/icons';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import moment from 'moment';
import { ToastController } from '@ionic/angular';

interface DiaSemana {
  diaSemana: string;
  diaMes: number;
  mes: string;
  clases: Clase[];
}

interface Clase {
  _id: string;
  titulo: string;
  horaInicio: string;
  horaFin: string;
  maxPlazas: number;
  instructor: {
    _id: string;
    nombre: string;
    foto?: string;
  };
  reservas: Reserva[];
  diaSemana?: string;  // Cambiado de diasSemana[] a diaSemana
  fecha?: string;      // Cambiado de fechaEspecial a fecha
}

interface Reserva {
  _id: string;
  atleta: {
    _id: string;
    nombre: string;
    foto?: string;
  };
  status: 'pendiente' | 'confirmada' | 'cancelada' | 'en_espera';
}

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.page.html',
  styleUrls: ['./reservas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ReservasPage implements OnInit {
  apiUrl = environment.apiUrl;
  diasSemana: { nombre: string; clases: any[] }[] = [];
  numeroSemana: number = 0;
  fechaInicio: Date = new Date();
  userId: string = '';
  clasesPorDia: { [key: string]: any[] } = {};

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastController: ToastController
  ) {
    addIcons({ calendarOutline, chevronForwardOutline, chevronBackOutline });
  }

  ngOnInit() {
    const user = this.authService.getUser();
    this.userId = user?._id || '';
    this.cargarClasesSemana();
  }

  getNumeroSemana(fecha: Date): number {
    const inicio = new Date(fecha.getFullYear(), 0, 1);
    const diff = fecha.getTime() - inicio.getTime();
    return Math.ceil((diff / 86400000 + inicio.getDay() + 1) / 7);
  }

  semanaAnterior() {
    this.fechaInicio.setDate(this.fechaInicio.getDate() - 7);
    this.generarSemanaActual();
    this.cargarClasesSemana();
  }

  siguienteSemana() {
    this.fechaInicio.setDate(this.fechaInicio.getDate() + 7);
    this.generarSemanaActual();
    this.cargarClasesSemana();
  }

  generarSemanaActual() {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const diaSemana = this.fechaInicio.getDay();
    const ajuste = diaSemana === 0 ? -6 : 1 - diaSemana;
    const fechaLunes = new Date(this.fechaInicio);
    fechaLunes.setDate(this.fechaInicio.getDate() + ajuste);
    
    this.numeroSemana = this.getNumeroSemana(fechaLunes);
    
    this.diasSemana = [];
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(fechaLunes);
      fecha.setDate(fechaLunes.getDate() + i);
      
      this.diasSemana.push({
        nombre: `${dias[fecha.getDay()]} ${fecha.getDate()} ${meses[fecha.getMonth()]}`,
        clases: []
      });
    }
  }

  obtenerFechaLunes(): string {
    const hoy = new Date();
    const dia = hoy.getDay();
    const diff = hoy.getDate() - dia + (dia === 0 ? -6 : 1); // Ajustar cuando es domingo
    const lunes = new Date(hoy.setDate(diff));
    lunes.setHours(0, 0, 0, 0);
    return lunes.toISOString();
  }

  getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  async cargarClasesSemana() {
    try {
      // Obtener la fecha del lunes de la semana actual
      const fechaLunes = this.obtenerFechaLunes();
      console.log('=== FRONTEND DEBUG === Fecha lunes:', fechaLunes);

      // Primero intentamos generar las clases de la semana
      try {
        const responseGeneracion = await this.http.post(
          `${this.apiUrl}/clases/generar-semana?fecha=${fechaLunes}`,
          {},
          { headers: this.getHeaders() }
        ).toPromise();
        console.log('=== FRONTEND DEBUG === Clases generadas:', responseGeneracion);
      } catch (error: any) {
        console.error('Error al generar clases:', error);
        // Si no es un error de permisos, lo ignoramos y continuamos
        if (error.status !== 403) {
          console.log('Continuando sin generar clases...');
        }
      }

      // Luego obtenemos las clases de la semana
      const response: any = await this.http.get(
        `${this.apiUrl}/clases/semana?fecha=${fechaLunes}`,
        { headers: this.getHeaders() }
      ).toPromise();

      console.log('=== FRONTEND DEBUG === Respuesta del servidor:', response);

      if (response && response.clases) {
        this.procesarClases(response.clases);
      } else {
        console.error('Formato de respuesta inválido:', response);
        this.presentToast('Error al cargar las clases');
      }
    } catch (error) {
      console.error('Error al cargar clases:', error);
      this.presentToast('Error al cargar las clases');
    }
  }

  procesarClases(clases: any[]) {
    // Inicializar el objeto de clases por día
    this.clasesPorDia = {
      'Lunes': [], 'Martes': [], 'Miércoles': [], 'Jueves': [],
      'Viernes': [], 'Sábado': [], 'Domingo': []
    };

    console.log('=== FRONTEND DEBUG === Procesando clases:', clases.length);

    // Procesar cada clase
    clases.forEach(clase => {
      const fecha = new Date(clase.fecha);
      const diaSemana = this.obtenerDiaSemana(fecha);
      
      console.log(`=== FRONTEND DEBUG === Procesando clase:`, {
        titulo: clase.titulo,
        fecha: fecha.toISOString(),
        diaSemana: diaSemana,
        esEspecial: !clase.diaSemana,
        reservas: clase.reservas?.length || 0
      });

      // Agregar la clase al día correspondiente
      if (this.clasesPorDia[diaSemana]) {
        this.clasesPorDia[diaSemana].push(clase);
      } else {
        console.error(`=== FRONTEND DEBUG === Día no encontrado para la clase:`, {
          titulo: clase.titulo,
          fecha: fecha.toISOString(),
          diaSemana: diaSemana
        });
      }
    });

    // Ordenar las clases por hora de inicio
    Object.keys(this.clasesPorDia).forEach(dia => {
      this.clasesPorDia[dia].sort((a, b) => {
        return a.horaInicio.localeCompare(b.horaInicio);
      });
    });

    // Actualizar el array de días de la semana con la fecha completa
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const fechaInicio = new Date(this.fechaInicio);
    const diaSemana = fechaInicio.getDay();
    const ajuste = diaSemana === 0 ? -6 : 1 - diaSemana;
    const fechaLunes = new Date(fechaInicio);
    fechaLunes.setDate(fechaInicio.getDate() + ajuste);

    this.diasSemana = Object.keys(this.clasesPorDia).map((dia, index) => {
      const fecha = new Date(fechaLunes);
      fecha.setDate(fechaLunes.getDate() + index);
      const clasesDelDia = this.clasesPorDia[dia];
      
      console.log(`=== FRONTEND DEBUG === Día ${dia}:`, {
        fecha: fecha.toISOString(),
        clases: clasesDelDia.length,
        clasesDetalle: clasesDelDia.map(c => ({
          titulo: c.titulo,
          fecha: c.fecha,
          esEspecial: !c.diaSemana
        }))
      });

      return {
        nombre: `${dia} ${fecha.getDate()} ${meses[fecha.getMonth()]}`,
        clases: clasesDelDia
      };
    });

    console.log('=== FRONTEND DEBUG === Días procesados:', this.diasSemana);
  }

  obtenerDiaSemana(fecha: Date): string {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[fecha.getDay()];
  }

  getMesNombre(mes: number): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[mes];
  }

  async reservarClase(claseId: string) {
    try {
      const response = await this.http.post(
        `${this.apiUrl}/reservas`,
        { claseId },
        { headers: this.getHeaders() }
      ).toPromise();
      
      console.log('Reserva creada:', response);
      this.presentToast('Clase reservada correctamente');
      this.cargarClasesSemana();
    } catch (error: any) {
      console.error('Error al reservar:', error);
      this.presentToast(error.error?.message || 'Error al reservar la clase');
    }
  }

  async cancelarReserva(reservaId: string) {
    try {
      await this.http.delete(
        `${this.apiUrl}/reservas/${reservaId}`,
        { headers: this.getHeaders() }
      ).toPromise();
      
      this.presentToast('Reserva cancelada correctamente');
      this.cargarClasesSemana();
    } catch (error: any) {
      console.error('Error al cancelar:', error);
      this.presentToast(error.error?.message || 'Error al cancelar la reserva');
    }
  }

  tieneReserva(clase: any): boolean {
    return clase.reservas?.some((r: any) => r.atleta._id === this.userId) || false;
  }

  getReservaUsuario(clase: any): any {
    return clase.reservas?.find((r: any) => r.atleta._id === this.userId);
  }
}