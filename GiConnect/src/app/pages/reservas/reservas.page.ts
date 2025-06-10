import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { interval, Subscription } from 'rxjs';

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
export class ReservasPage implements OnInit, OnDestroy {
  apiUrl = environment.apiUrl;
  diasSemana: { nombre: string; clases: any[] }[] = [];
  clasesEspeciales: { nombre: string; clases: any[] }[] = [];
  numeroSemana: number = 0;
  fechaInicio: Date = new Date();
  userId: string = '';
  clasesPorDia: { [key: string]: any[] } = {};
  private checkInterval: Subscription = new Subscription();
  private reloadListener: any;
  isAdminOrMaestro: boolean = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastController: ToastController
  ) {
    addIcons({ calendarOutline, chevronForwardOutline, chevronBackOutline });
    const user = this.authService.getUser();
    this.isAdminOrMaestro = user?.role === 'admin' || user?.role === 'maestro';
  }

  ngOnInit() {
    const user = this.authService.getUser();
    this.userId = user?._id || '';
    this.cargarClasesSemana();
    this.iniciarVerificacionSemanal();
    this.setupReloadListener();
  }

  ngOnDestroy() {
    if (this.checkInterval) {
      this.checkInterval.unsubscribe();
    }
    if (this.reloadListener) {
      window.removeEventListener('reloadReservas', this.reloadListener);
    }
  }

  private iniciarVerificacionSemanal() {
    // Verificar cada minuto si es domingo a las 22:00
    this.checkInterval = interval(60000).subscribe(() => {
      const ahora = new Date();
      if (ahora.getDay() === 0 && ahora.getHours() === 22 && ahora.getMinutes() === 0) {
        this.cargarClasesSemana();
      }
    });
  }

  private setupReloadListener() {
    this.reloadListener = (event: Event) => {
      if (event instanceof CustomEvent && event.type === 'reloadReservas') {
        this.cargarClasesSemana();
      }
    };
    window.addEventListener('reloadReservas', this.reloadListener);
  }

  getNumeroSemana(fecha: Date): number {
    const inicio = new Date(fecha.getFullYear(), 0, 1);
    const diff = fecha.getTime() - inicio.getTime();
    return Math.ceil((diff / 86400000 + inicio.getDay() + 1) / 7);
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
      message: message,
      duration: 3000,
      position: 'middle',
      cssClass: 'custom-toast',
      translucent: true
    });
    await toast.present();
  }

  async cargarClasesSemana() {
    try {
      // Obtener la fecha del lunes de la semana actual
      const fechaLunes = this.obtenerFechaLunes();
      console.log('=== FRONTEND DEBUG === Fecha lunes:', fechaLunes);

      // Generar la semana actual
      this.generarSemanaActual();

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

  generarSemanaActual() {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const ajuste = diaSemana === 0 ? -6 : 1 - diaSemana;
    const fechaLunes = new Date(hoy);
    fechaLunes.setDate(hoy.getDate() + ajuste);
    
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

  procesarClases(clases: any[]) {
    // Inicializar el objeto de clases por día
    this.clasesPorDia = {
      'Lunes': [], 'Martes': [], 'Miércoles': [], 'Jueves': [],
      'Viernes': [], 'Sábado': [], 'Domingo': []
    };

    // Inicializar array de clases especiales
    this.clasesEspeciales = [];

    console.log('=== FRONTEND DEBUG === Procesando clases:', clases.length);

    // Obtener el fin de la semana actual
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const ajuste = diaSemana === 0 ? -6 : 1 - diaSemana;
    const fechaLunes = new Date(hoy);
    fechaLunes.setDate(hoy.getDate() + ajuste);
    const fechaFinSemana = new Date(fechaLunes);
    fechaFinSemana.setDate(fechaLunes.getDate() + 6);
    fechaFinSemana.setHours(23, 59, 59, 999);

    console.log('=== FRONTEND DEBUG === Fechas de referencia:', {
      hoy: hoy.toISOString(),
      fechaLunes: fechaLunes.toISOString(),
      fechaFinSemana: fechaFinSemana.toISOString()
    });

    // Procesar cada clase
    clases.forEach(clase => {
      const fecha = new Date(clase.fecha);
      
      console.log('=== FRONTEND DEBUG === Procesando clase:', {
        titulo: clase.titulo,
        fecha: fecha.toISOString(),
        esEspecial: !clase.diaSemana,
        fechaFinSemana: fechaFinSemana.toISOString(),
        esPosterior: fecha > fechaFinSemana
      });

      // Si es una clase especial (sin diaSemana) y su fecha es posterior al fin de la semana actual
      if (!clase.diaSemana && fecha > fechaFinSemana) {
        const diaSemana = this.obtenerDiaSemana(fecha);
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const nombreDia = `${diaSemana} ${fecha.getDate()} ${meses[fecha.getMonth()]}`;
        
        console.log('=== FRONTEND DEBUG === Agregando clase especial:', {
          nombreDia,
          titulo: clase.titulo,
          fecha: fecha.toISOString()
        });

        // Buscar si ya existe un día con esta fecha
        let diaExistente = this.clasesEspeciales.find(d => d.nombre === nombreDia);
        if (!diaExistente) {
          diaExistente = { nombre: nombreDia, clases: [] };
          this.clasesEspeciales.push(diaExistente);
        }
        diaExistente.clases.push(clase);
      } else {
        const diaSemana = this.obtenerDiaSemana(fecha);
        if (this.clasesPorDia[diaSemana]) {
          this.clasesPorDia[diaSemana].push(clase);
        }
      }
    });

    console.log('=== FRONTEND DEBUG === Clases especiales encontradas:', this.clasesEspeciales);

    // Ordenar las clases por hora de inicio en cada día
    Object.keys(this.clasesPorDia).forEach(dia => {
      this.clasesPorDia[dia].sort((a, b) => {
        return a.horaInicio.localeCompare(b.horaInicio);
      });
    });

    // Ordenar las clases especiales por fecha y hora
    this.clasesEspeciales.sort((a, b) => {
      const fechaA = new Date(a.nombre.split(' ')[1] + ' ' + a.nombre.split(' ')[2] + ' ' + new Date().getFullYear());
      const fechaB = new Date(b.nombre.split(' ')[1] + ' ' + b.nombre.split(' ')[2] + ' ' + new Date().getFullYear());
      return fechaA.getTime() - fechaB.getTime();
    });

    this.clasesEspeciales.forEach(dia => {
      dia.clases.sort((a, b) => {
        return a.horaInicio.localeCompare(b.horaInicio);
      });
    });

    // Actualizar el array de días de la semana con la fecha completa
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    this.diasSemana = Object.keys(this.clasesPorDia).map((dia, index) => {
      const fecha = new Date(fechaLunes);
      fecha.setDate(fechaLunes.getDate() + index);
      const clasesDelDia = this.clasesPorDia[dia];
      
      return {
        nombre: `${dia} ${fecha.getDate()} ${meses[fecha.getMonth()]}`,
        clases: clasesDelDia
      };
    });

    console.log('=== FRONTEND DEBUG === Días de la semana:', this.diasSemana);
    console.log('=== FRONTEND DEBUG === Clases especiales finales:', this.clasesEspeciales);
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
      const endpoint = this.isAdminOrMaestro ? '/reservas/multiple' : '/reservas';
      console.log('=== FRONTEND DEBUG === Iniciando reserva:', {
        endpoint,
        isAdminOrMaestro: this.isAdminOrMaestro,
        claseId,
        headers: this.getHeaders()
      });

      console.log('=== FRONTEND DEBUG === Enviando petición a:', `${this.apiUrl}${endpoint}`);
      
      const response = await this.http.post(
        `${this.apiUrl}${endpoint}`,
        { claseId },
        { headers: this.getHeaders() }
      ).toPromise();
      
      console.log('=== FRONTEND DEBUG === Respuesta del servidor:', response);
      this.presentToast('Clase reservada correctamente');
      this.cargarClasesSemana();
    } catch (error: any) {
      console.error('=== FRONTEND DEBUG === Error completo:', error);
      console.error('=== FRONTEND DEBUG === Error status:', error.status);
      console.error('=== FRONTEND DEBUG === Error message:', error.error);
      console.error('=== FRONTEND DEBUG === Error headers:', error.headers);
      this.presentToast(error.error?.message || 'Error al reservar la clase');
    }
  }

  async cancelarReserva(reservaId: string) {
    try {
      const response = await this.http.delete(
        `${this.apiUrl}/reservas/${reservaId}`,
        { headers: this.getHeaders() }
      ).toPromise();
      
      this.presentToast('Reserva cancelada correctamente');
      // Recargar las clases para actualizar la interfaz
      await this.cargarClasesSemana();
    } catch (error: any) {
      console.error('Error al cancelar:', error);
      this.presentToast(error.error?.message || 'Error al cancelar la reserva');
    }
  }

  tieneReserva(clase: any): boolean {
    if (this.isAdminOrMaestro) {
      return false; // Los maestros y admins siempre pueden reservar
    }
    return clase.reservas?.some((r: any) => r.atleta._id === this.userId) || false;
  }

  getReservaUsuario(clase: any): any {
    if (this.isAdminOrMaestro) {
      // Para admin/maestro, obtener la última reserva que hizo en esta clase
      return clase.reservas
        ?.filter((r: any) => r.atleta._id === this.userId)
        .sort((a: any, b: any) => new Date(b.fechaReserva).getTime() - new Date(a.fechaReserva).getTime())[0];
    }
    // Para usuarios normales, obtener su reserva
    return clase.reservas?.find((r: any) => r.atleta._id === this.userId);
  }
}