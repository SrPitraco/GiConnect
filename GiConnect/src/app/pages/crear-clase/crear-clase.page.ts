import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, LoadingController, PopoverController, ToastController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user.interface';
import { InstructorPopoverComponent } from '../../components/instructor-popover/instructor-popover.component';
import { addIcons } from 'ionicons';
import { calendarOutline, timeOutline, personOutline, saveOutline } from 'ionicons/icons';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-crear-clase',
  templateUrl: './crear-clase.page.html',
  styleUrls: ['./crear-clase.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    InstructorPopoverComponent
  ]
})
export class CrearClasePage implements OnInit {
  claseForm: FormGroup;
  tipoClase: string = 'fija';
  instructores: User[] = [];
  isAdmin = false;
  isMaestro = false;
  minDate = new Date();
  diasSemana = [
    { id: 'Lunes', nombre: 'Lunes' },
    { id: 'Martes', nombre: 'Martes' },
    { id: 'Miércoles', nombre: 'Miércoles' },
    { id: 'Jueves', nombre: 'Jueves' },
    { id: 'Viernes', nombre: 'Viernes' },
    { id: 'Sábado', nombre: 'Sábado' },
    { id: 'Domingo', nombre: 'Domingo' }
  ];
  instructorSeleccionado: User | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private authService: AuthService,
    private userService: UserService,
    private popoverController: PopoverController,
    private http: HttpClient,
    private toastController: ToastController
  ) {
    addIcons({ calendarOutline, timeOutline, personOutline, saveOutline });
    this.claseForm = this.formBuilder.group({
      titulo: ['', [Validators.required]],
      descripcion: [''],
      tipoClase: ['fija', [Validators.required]],
      diasSeleccionados: [[], [Validators.required]],
      fecha: [null],
      horaInicio: ['', [
        Validators.required,
        Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      ]],
      horaFin: ['', [
        Validators.required,
        Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      ]],
      maxPlazas: [10, [Validators.required, Validators.min(1)]],
      instructor: [null, [Validators.required]]
    });

    // Suscribirse a cambios en el tipo de clase
    this.claseForm.get('tipoClase')?.valueChanges.subscribe(tipo => {
      if (tipo === 'fija') {
        this.claseForm.get('fecha')?.clearValidators();
        this.claseForm.get('diasSeleccionados')?.setValidators([Validators.required]);
      } else {
        this.claseForm.get('diasSeleccionados')?.clearValidators();
        this.claseForm.get('fecha')?.setValidators([Validators.required]);
      }
      this.claseForm.get('fecha')?.updateValueAndValidity();
      this.claseForm.get('diasSeleccionados')?.updateValueAndValidity();
    });
  }

  async ngOnInit() {
    const user = this.authService.getUser();
    this.isAdmin = user?.role === 'admin';
    this.isMaestro = user?.role === 'maestro';
    if (user?.nombre) {
      this.claseForm.patchValue({
        instructor: user.nombre
      });
    }
    await this.cargarInstructores();
  }

  async cargarInstructores() {
    try {
      const instructores = await firstValueFrom(this.userService.getUsers());
      this.instructores = instructores.filter(user => 
        user.role === 'instructor' || user.role === 'maestro'
      );
    } catch (error) {
      console.error('Error al cargar instructores:', error);
    }
  }

  async mostrarSelectorInstructor(ev: any) {
    const popover = await this.popoverController.create({
      component: InstructorPopoverComponent,
      event: ev,
      translucent: true,
      cssClass: 'instructor-popover',
      componentProps: {
        instructores: this.instructores
      }
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data) {
      this.claseForm.patchValue({
        instructor: data._id
      });
      this.instructorSeleccionado = data;
    }
  }

  incrementarHora(campo: string) {
    const valorActual = this.claseForm.get(campo)?.value || '00:00';
    const [horas, minutos] = valorActual.split(':').map(Number);
    const nuevaHora = (horas + 1) % 24;
    this.claseForm.get(campo)?.setValue(`${nuevaHora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`);
  }

  decrementarHora(campo: string) {
    const valorActual = this.claseForm.get(campo)?.value || '00:00';
    const [horas, minutos] = valorActual.split(':').map(Number);
    const nuevaHora = (horas - 1 + 24) % 24;
    this.claseForm.get(campo)?.setValue(`${nuevaHora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`);
  }

  incrementarMinuto(campo: string) {
    const valorActual = this.claseForm.get(campo)?.value || '00:00';
    const [horas, minutos] = valorActual.split(':').map(Number);
    const nuevoMinuto = (minutos + 1) % 60;
    this.claseForm.get(campo)?.setValue(`${horas.toString().padStart(2, '0')}:${nuevoMinuto.toString().padStart(2, '0')}`);
  }

  decrementarMinuto(campo: string) {
    const valorActual = this.claseForm.get(campo)?.value || '00:00';
    const [horas, minutos] = valorActual.split(':').map(Number);
    const nuevoMinuto = (minutos - 1 + 60) % 60;
    this.claseForm.get(campo)?.setValue(`${horas.toString().padStart(2, '0')}:${nuevoMinuto.toString().padStart(2, '0')}`);
  }

  toggleDia(diaId: string) {
    const diasSeleccionados = this.claseForm.get('diasSeleccionados')?.value || [];
    const index = diasSeleccionados.indexOf(diaId);
    
    if (index === -1) {
      diasSeleccionados.push(diaId);
    } else {
      diasSeleccionados.splice(index, 1);
    }
    
    this.claseForm.patchValue({ diasSeleccionados });
  }

  isDiaSeleccionado(diaId: string): boolean {
    const diasSeleccionados = this.claseForm.get('diasSeleccionados')?.value || [];
    return diasSeleccionados.includes(diaId);
  }

  // Función para capitalizar la primera letra de cada palabra
  private capitalizarPrimeraLetra(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  }

  async onSubmit() {
    if (this.claseForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Creando clase...'
      });
      await loading.present();

      try {
        const formData = this.claseForm.value;
        console.log('Datos del formulario:', formData);
        
        // Validar que tenemos un instructor seleccionado
        if (!formData.instructor) {
          throw new Error('Debes seleccionar un instructor');
        }

        // Preparar los datos según el tipo de clase
        const claseData: any = {
          titulo: formData.titulo,
          descripcion: formData.descripcion || '',
          horaInicio: formData.horaInicio,
          horaFin: formData.horaFin,
          maxPlazas: parseInt(formData.maxPlazas) || 10,
          instructor: formData.instructor
        };

        // Añadir diaSemana o fecha según el tipo de clase
        if (formData.tipoClase === 'fija') {
          if (!formData.diasSeleccionados || formData.diasSeleccionados.length === 0) {
            throw new Error('Debes seleccionar al menos un día de la semana');
          }
          // Crear una clase para cada día seleccionado
          const clasesPromises = formData.diasSeleccionados.map((dia: string) => {
            const clasePorDia = {
              ...claseData,
              diaSemana: dia
            };
            return firstValueFrom(this.http.post(`${environment.apiUrl}/clases`, clasePorDia));
          });

          const responses = await Promise.all(clasesPromises);
          console.log('Clases creadas:', responses);

          await loading.dismiss();
          
          const toast = await this.toastController.create({
            message: `Se han creado ${responses.length} clases correctamente`,
            duration: 2000,
            position: 'middle',
            color: 'success',
            cssClass: 'toast-top',
            buttons: []
          });
          await toast.present();
          
          this.router.navigate(['/mestre-portal']);
        } else {
          if (!formData.fecha) {
            throw new Error('Debes seleccionar una fecha');
          }
          claseData.fecha = new Date(formData.fecha).toISOString();

          console.log('Datos a enviar al backend:', claseData);
          console.log('Tipo de clase:', formData.tipoClase);
          console.log('Fecha seleccionada:', formData.fecha);

          const response = await firstValueFrom(
            this.http.post(`${environment.apiUrl}/clases`, claseData)
          );

          console.log('Respuesta del backend:', response);

          await loading.dismiss();
          
          const toast = await this.toastController.create({
            message: 'Clase creada correctamente',
            duration: 2000,
            position: 'middle',
            color: 'success',
            cssClass: 'toast-top',
            buttons: []
          });
          await toast.present();
          
          this.router.navigate(['/mestre-portal']);
        }
      } catch (error: any) {
        await loading.dismiss();
        console.error('Error al crear la clase:', error);
        console.error('Detalles del error:', error.error);
        
        const alert = await this.alertController.create({
          header: 'Error',
          message: error.error?.message || error.message || 'No se pudo crear la clase. Por favor, inténtalo de nuevo.',
          buttons: ['OK']
        });
        await alert.present();
      }
    } else {
      console.log('Formulario inválido:', this.claseForm.errors);
      console.log('Estado del formulario:', this.claseForm.getRawValue());
    }
  }

  obtenerNombreInstructor(): string {
    if (this.instructorSeleccionado) {
      return `${this.instructorSeleccionado.nombre} ${this.instructorSeleccionado.apellido1}`;
    }
    return 'Seleccionar Instructor';
  }
} 