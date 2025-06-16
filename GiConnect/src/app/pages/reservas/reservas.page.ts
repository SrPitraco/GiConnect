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
  diaSemana?: string;
  fecha: Date;
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
    // Si es domingo después de las 15:00, mostrar la semana siguiente
    if (dia === 0 && hoy.getHours() >= 15) {
      const lunes = new Date(hoy);
      lunes.setDate(hoy.getDate() + 1); // Lunes de la semana siguiente
      lunes.setHours(0, 0, 0, 0);
      return lunes.toISOString();
    }
    // Si no, mostrar la semana actual
    const diff = hoy.getDate() - dia + (dia === 0 ? -6 : 1);
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

      // Intentamos generar las clases de la semana
      try {
        const responseGeneracion = await this.http.post(
          `${this.apiUrl}/clases/generar-semana?fecha=${fechaLunes}`,
          {},
          { headers: this.getHeaders() }
        ).toPromise();
        console.log('=== FRONTEND DEBUG === Clases generadas:', responseGeneracion);
      } catch (error: any) {
        console.error('Error al generar clases:', error);
        // Si es un error 404, probablemente la ruta no está disponible en producción
        if (error.status === 404) {
          console.log('La ruta de generación de clases no está disponible');
        }
      }

      // Obtenemos las clases de la semana actual
      const response: any = await this.http.get(
        `${this.apiUrl}/clases/semana?fecha=${fechaLunes}`,
        { headers: this.getHeaders() }
      ).toPromise();

      console.log('=== FRONTEND DEBUG === Respuesta del servidor:', response);

      if (response && response.clases) {
        // Procesamos las clases de la semana actual
        this.procesarClases(response.clases, []);

        // Obtenemos las clases especiales (posteriores a la semana actual)
        await this.cargarClasesEspeciales(fechaLunes);
      } else {
        console.error('Formato de respuesta inválido:', response);
        this.presentToast('Error al cargar las clases');
      }
    } catch (error) {
      console.error('Error al cargar clases:', error);
      this.presentToast('Error al cargar las clases');
    }
  }

  async cargarClasesEspeciales(fechaLunes: string) {
    try {
      // Calculamos la fecha del fin de la semana actual
      const fechaFinSemana = new Date(fechaLunes);
      fechaFinSemana.setDate(fechaFinSemana.getDate() + 6);
      fechaFinSemana.setHours(23, 59, 59, 999);

      // Obtenemos las clases especiales (posteriores a la semana actual)
      const response: any = await this.http.get(
        `${this.apiUrl}/clases/especiales?fecha=${fechaFinSemana.toISOString()}`,
        { headers: this.getHeaders() }
      ).toPromise();

      console.log('=== FRONTEND DEBUG === Clases especiales recibidas:', response);

      if (response && response.clases) {
        // Procesamos las clases especiales
        this.procesarClasesEspeciales(response.clases);
      }
    } catch (error) {
      console.error('Error al cargar clases especiales:', error);
    }
  }

  procesarClasesEspeciales(clases: Clase[]) {
    if (!clases || clases.length === 0) {
      this.clasesEspeciales = [];
      return;
    }

    // Agrupar las clases especiales por fecha
    const clasesPorFecha = new Map<string, Clase[]>();
    
    clases.forEach(clase => {
      const fecha = clase.fecha instanceof Date ? clase.fecha : new Date(clase.fecha);
      const fechaStr = fecha.toISOString().split('T')[0];
      
      if (!clasesPorFecha.has(fechaStr)) {
        clasesPorFecha.set(fechaStr, []);
      }
      clasesPorFecha.get(fechaStr)?.push(clase);
    });

    // Convertir el Map a un array de objetos con nombre y clases
    this.clasesEspeciales = Array.from(clasesPorFecha.entries()).map(([fechaStr, clases]) => {
      const fecha = new Date(fechaStr);
      const diaSemana = this.obtenerDiaSemana(fecha);
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const nombre = `${diaSemana} ${fecha.getDate()} ${meses[fecha.getMonth()]}`;
      
      // Ordenar las clases por hora de inicio
      clases.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
      
      return { nombre, clases };
    });

    // Ordenar las fechas
    this.clasesEspeciales.sort((a, b) => {
      const fechaA = new Date(a.nombre.split(' ')[1] + ' ' + a.nombre.split(' ')[2] + ' ' + new Date().getFullYear());
      const fechaB = new Date(b.nombre.split(' ')[1] + ' ' + b.nombre.split(' ')[2] + ' ' + new Date().getFullYear());
      return fechaA.getTime() - fechaB.getTime();
    });

    console.log('=== FRONTEND DEBUG === Clases especiales procesadas:', this.clasesEspeciales);
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

  procesarClases(clases: Clase[], clasesEspeciales: Clase[]) {
    // Inicializar el objeto de clases por día
    this.clasesPorDia = {
      'Lunes': [], 'Martes': [], 'Miércoles': [], 'Jueves': [],
      'Viernes': [], 'Sábado': [], 'Domingo': []
    };

    // Inicializar array de clases especiales
    this.clasesEspeciales = [];

    console.log('=== FRONTEND DEBUG === Procesando clases:', clases.length);
    console.log('=== FRONTEND DEBUG === Procesando clases especiales:', clasesEspeciales?.length || 0);

    // Obtener la fecha del lunes de la semana actual
    const fechaLunes = new Date(this.obtenerFechaLunes());
    const fechaFinSemana = new Date(fechaLunes);
    fechaFinSemana.setDate(fechaLunes.getDate() + 6);
    fechaFinSemana.setHours(23, 59, 59, 999);

    // Procesar clases de la semana actual
    clases.forEach(clase => {
      // Asegurarnos de que fecha es un objeto Date
      const fecha = clase.fecha instanceof Date ? clase.fecha : new Date(clase.fecha);
      
      // Si la fecha está dentro de la semana actual
      if (fecha >= fechaLunes && fecha <= fechaFinSemana) {
        const diaSemana = this.obtenerDiaSemana(fecha);
        if (this.clasesPorDia[diaSemana]) {
          this.clasesPorDia[diaSemana].push(clase);
        }
      }
    });

    // Procesar clases especiales futuras
    if (clasesEspeciales && clasesEspeciales.length > 0) {
      // Agrupar las clases especiales por fecha
      const clasesPorFecha = new Map<string, Clase[]>();
      
      clasesEspeciales.forEach(clase => {
        // Asegurarnos de que fecha es un objeto Date
        const fecha = clase.fecha instanceof Date ? clase.fecha : new Date(clase.fecha);
        
        // Solo incluir clases futuras (después del fin de la semana actual)
        if (fecha > fechaFinSemana) {
          const fechaStr = fecha.toISOString().split('T')[0];
          
          if (!clasesPorFecha.has(fechaStr)) {
            clasesPorFecha.set(fechaStr, []);
          }
          clasesPorFecha.get(fechaStr)?.push(clase);
        }
      });

      // Convertir el Map a un array de objetos con nombre y clases
      this.clasesEspeciales = Array.from(clasesPorFecha.entries()).map(([fechaStr, clases]) => {
        const fecha = new Date(fechaStr);
        const diaSemana = this.obtenerDiaSemana(fecha);
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const nombre = `${diaSemana} ${fecha.getDate()} ${meses[fecha.getMonth()]}`;
        
        // Ordenar las clases por hora de inicio
        clases.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
        
        return { nombre, clases };
      });

      // Ordenar las fechas
      this.clasesEspeciales.sort((a, b) => {
        const fechaA = new Date(a.nombre.split(' ')[1] + ' ' + a.nombre.split(' ')[2] + ' ' + new Date().getFullYear());
        const fechaB = new Date(b.nombre.split(' ')[1] + ' ' + b.nombre.split(' ')[2] + ' ' + new Date().getFullYear());
        return fechaA.getTime() - fechaB.getTime();
      });
    }

    // Ordenar las clases por hora de inicio en cada día
    Object.keys(this.clasesPorDia).forEach(dia => {
      this.clasesPorDia[dia].sort((a, b) => {
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