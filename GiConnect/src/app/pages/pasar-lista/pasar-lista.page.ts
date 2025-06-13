import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ClaseService } from '../../services/clase.service';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

interface Atleta {
  _id: string;
  nombre: string;
  apellidos: string;
  foto?: string;
}

interface Reserva {
  _id: string;
  atleta: Atleta;
  status: string;
  asistenciaConfirmada: boolean;
}

interface Clase {
  _id: string;
  titulo: string;
  instructor: {
    nombre: string;
    apellidos: string;
    foto?: string;
  };
  horaInicio: string;
  horaFin: string;
  fecha: string;
  reservas: Reserva[];
  supervisada: boolean;
}

@Component({
  selector: 'app-pasar-lista',
  templateUrl: './pasar-lista.page.html',
  styleUrls: ['./pasar-lista.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class PasarListaPage implements OnInit {
  clases: Clase[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private claseService: ClaseService,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.cargarClases();
  }

  cargarClases() {
    this.loading = true;
    this.error = null;

    this.claseService.getClasesParaPasarLista().subscribe({
      next: (response) => {
        console.log('=== FRONTEND DEBUG === Clases recibidas:', response);
        this.clases = response;
        this.clases.forEach(clase => {
          console.log(`=== FRONTEND DEBUG === Clase "${clase.titulo}":`, {
            id: clase._id,
            reservas: clase.reservas.length,
            reservasDetalle: clase.reservas.map(r => ({
              id: r._id,
              atleta: r.atleta.nombre + ' ' + r.atleta.apellidos,
              status: r.status
            }))
          });
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar las clases:', error);
        this.error = 'Error al cargar las clases. Por favor, inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }

  marcarTodos(clase: Clase) {
    clase.reservas.forEach(reserva => {
      reserva.asistenciaConfirmada = true;
    });
  }

  async confirmarAsistencia(clase: Clase) {
    const alert = await this.alertController.create({
      header: 'Confirmar Asistencia',
      message: '¿Estás seguro de que quieres confirmar la asistencia de esta clase?',
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Sí',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.procesarAsistencia(clase);
          }
        }
      ]
    });

    await alert.present();
  }

  private async procesarAsistencia(clase: Clase) {
    try {
      console.log('Procesando asistencia para clase:', clase);
      
      const reservasActualizadas = clase.reservas.map(reserva => {
        console.log('Reserva:', reserva);
        return {
          reservaId: reserva._id,
          status: 'confirmada',
          asistenciaConfirmada: reserva.asistenciaConfirmada
        };
      });

      console.log('Reservas a actualizar:', reservasActualizadas);

      if (reservasActualizadas.length === 0) {
        console.error('No hay reservas para actualizar');
        return;
      }

      const claseActualizada = await firstValueFrom(this.claseService.confirmarAsistencia(clase._id, {
        reservas: reservasActualizadas,
        supervisada: true
      }));

      if (claseActualizada) {
        // Actualizar la clase en el array local
        const index = this.clases.findIndex(c => c._id === clase._id);
        if (index !== -1) {
          this.clases[index] = claseActualizada;
        }

        // Mostrar mensaje de éxito
        const toast = await this.toastController.create({
          message: 'Asistencia confirmada correctamente',
          duration: 2000,
          position: 'bottom',
          color: 'success'
        });
        await toast.present();
      }
    } catch (error) {
      console.error('Error al procesar asistencia:', error);
      
      // Mostrar mensaje de error
      const toast = await this.toastController.create({
        message: 'Error al confirmar la asistencia',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    }
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/icon/avatar.svg';
  }
}
