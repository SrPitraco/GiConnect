import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TIPOS_SUSCRIPCION, TipoSuscripcion } from '../../constants/suscripciones';
import { AuthService } from '../../services/auth.service';
import { SuscripcionService } from '../../services/suscripcion.service';
import { formatDate, registerLocaleData } from '@angular/common';
import { Suscripcion, NuevaSuscripcion } from '../../interfaces/suscripcion.interface';
import { IonicModule, ModalController, Platform, PickerController, AlertController, ActionSheetController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { timeOutline, calendarOutline, checkmarkCircle, cardOutline, addCircleOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs);

// Define custom date formats
export const DD_MM_YYYY_FORMAT = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-suscripciones',
  templateUrl: './suscripciones.page.html',
  styleUrls: ['./suscripciones.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    // Use the custom date format
    { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_FORMAT },
  ]
})
export class SuscripcionesPage implements OnInit, OnDestroy {
  suscripcionesActivas: Suscripcion[] = [];
  tiposSuscripcion = TIPOS_SUSCRIPCION;
  suscripcionForm: FormGroup;
  isAdminOrMaestro = false;
  minDate: Date;
  maxDate: Date;
  public platform: Platform;
  private currentActionSheet: HTMLIonActionSheetElement | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private suscripcionService: SuscripcionService,
    private modalCtrl: ModalController,
    platform: Platform,
    private pickerCtrl: PickerController,
    private alertController: AlertController,
    private actionSheetCtrl: ActionSheetController
  ) {
    this.platform = platform;
    const today = new Date();
    this.minDate = today;
    
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    this.maxDate = maxDate;

    this.suscripcionForm = this.fb.group({
      tipo: ['', Validators.required],
      fechaInicio: [null, Validators.required],
      precio: [{ value: '', disabled: true }],
      fechaFin: [{ value: '', disabled: true }]
    });
    addIcons({ timeOutline, calendarOutline, checkmarkCircle, cardOutline, addCircleOutline });

    // Configuración específica para iOS
    if (this.platform.is('ios')) {
      this.platform.ready().then(() => {
        const select = document.querySelector('.custom-select');
        if (select) {
          select.setAttribute('interface', 'popover');
        }
      });
    }
  }

  ngOnInit() {
    this.checkUserRole();
    this.loadSuscripciones();
    this.setupFormListeners();
  }

  onFechaInicioSelected(event: any) {
    if (event) {
      this.suscripcionForm.get('fechaInicio')?.setValue(event);
    }
  }

  private checkUserRole() {
    const user = this.authService.getUser();
    this.isAdminOrMaestro = user?.role === 'admin' || user?.role === 'maestro';
  }

  private setupFormListeners() {
    this.suscripcionForm.get('tipo')?.valueChanges.subscribe(tipoId => {
      const tipo = this.tiposSuscripcion.find(t => t.id === tipoId);
      if (tipo) {
        this.suscripcionForm.patchValue({
          precio: tipo.precio
        });
      }
    });

    this.suscripcionForm.get('fechaInicio')?.valueChanges.subscribe(fechaInicio => {
      const tipoId = this.suscripcionForm.get('tipo')?.value;
      if (fechaInicio && tipoId) {
        const tipo = this.tiposSuscripcion.find(t => t.id === tipoId);
        if (tipo) {
          const fechaFin = new Date(fechaInicio);
          fechaFin.setMonth(fechaFin.getMonth() + tipo.meses);
          this.suscripcionForm.patchValue({
            fechaFin: fechaFin
          });
        }
      }
    });
  }

  private loadSuscripciones() {
    if (!this.isAdminOrMaestro) {
      this.suscripcionService.getSuscripcionesActivas().subscribe(
        (suscripciones: Suscripcion[]) => {
          this.suscripcionesActivas = suscripciones;
        },
        (error: any) => {
          console.error('Error al cargar suscripciones:', error);
        }
      );
    }
  }

  onSubmit() {
    console.log('Intentando enviar formulario...');
    console.log('Formulario válido:', this.suscripcionForm.valid);
    console.log('Valores del formulario:', this.suscripcionForm.getRawValue());
    
    if (this.suscripcionForm.valid) {
      this.isLoading = true;
      const currentUser = this.authService.getUser();
      
      console.log('Usuario actual:', currentUser);
      
      if (!currentUser) {
        this.isLoading = false;
        this.alertController.create({
          header: 'Error',
          message: 'Debes iniciar sesión para crear una suscripción',
          buttons: ['OK']
        }).then(alert => alert.present());
        return;
      }

      const formValue = this.suscripcionForm.getRawValue();
      console.log('Valor del tipo seleccionado:', formValue.tipo);
      console.log('Tipo de fechaInicio:', typeof formValue.fechaInicio);
      console.log('Valor de fechaInicio:', formValue.fechaInicio);
      console.log('Tipo de fechaFin:', typeof formValue.fechaFin);
      console.log('Valor de fechaFin:', formValue.fechaFin);
      console.log('Tipo de precio:', typeof formValue.precio);
      console.log('Valor de precio:', formValue.precio);

      // Asegurarnos de que las fechas son objetos Date válidos
      const fechaInicio = formValue.fechaInicio instanceof Date ? formValue.fechaInicio : new Date(formValue.fechaInicio);
      const fechaFin = formValue.fechaFin instanceof Date ? formValue.fechaFin : new Date(formValue.fechaFin);

      const suscripcionToCreate: NuevaSuscripcion = {
        tipo: formValue.tipo,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        precio: Number(formValue.precio),
        atleta: currentUser._id,
        pagado: true
      };

      console.log('Suscripción a crear:', suscripcionToCreate);

      this.suscripcionService.createSuscripcion(suscripcionToCreate).subscribe({
        next: (response: Suscripcion) => {
          console.log('Suscripción creada con éxito:', response);
          this.loadSuscripciones();
          this.suscripcionForm.reset();
          this.isLoading = false;
          
          // Mostrar mensaje de éxito
          this.alertController.create({
            header: 'Éxito',
            message: 'Suscripción creada correctamente',
            buttons: [{
              text: 'OK',
              handler: () => {
                this.router.navigate(['/home']);
              }
            }]
          }).then(alert => alert.present());
        },
        error: (error: any) => {
          console.error('Error al crear suscripción:', error);
          console.error('Detalles del error:', {
            status: error.status,
            message: error.error?.message,
            error: error.error
          });
          this.isLoading = false;
          
          let errorMessage = 'No se pudo crear la suscripción. Por favor, inténtalo de nuevo.';
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
          
          this.alertController.create({
            header: 'Error',
            message: errorMessage,
            buttons: ['OK']
          }).then(alert => alert.present());
        }
      });
    } else {
      console.log('Errores del formulario:', this.suscripcionForm.errors);
      console.log('Estado de los campos:', {
        tipo: this.suscripcionForm.get('tipo')?.errors,
        fechaInicio: this.suscripcionForm.get('fechaInicio')?.errors,
        precio: this.suscripcionForm.get('precio')?.errors,
        fechaFin: this.suscripcionForm.get('fechaFin')?.errors
      });
      
      // Mostrar mensaje de error si el formulario no es válido
      this.alertController.create({
        header: 'Error',
        message: 'Por favor, completa todos los campos requeridos correctamente',
        buttons: ['OK']
      }).then(alert => alert.present());
    }
  }

  async openPicker() {
    if (this.platform.is('ios')) {
      const picker = await this.pickerCtrl.create({
        columns: [
          {
            name: 'tipo',
            options: this.tiposSuscripcion.map(tipo => ({
              text: `${tipo.nombre} - ${tipo.precio}€`,
              value: tipo.id
            }))
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Confirmar',
            handler: (value) => {
              this.suscripcionForm.get('tipo')?.setValue(value.tipo.value);
            }
          }
        ]
      });

      await picker.present();
    }
  }

  async openSubscriptionOptions() {
    // Si ya hay un action-sheet abierto, lo cerramos primero
    if (this.currentActionSheet) {
      await this.currentActionSheet.dismiss();
      this.currentActionSheet = null;
      return;
    }

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Tipo de Suscripción',
      buttons: [
        ...this.tiposSuscripcion.map(tipo => ({
          text: `${tipo.nombre} - ${tipo.precio}€`,
          handler: () => {
            this.suscripcionForm.patchValue({ tipo: tipo.id });
            this.currentActionSheet = null;
          }
        })),
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.currentActionSheet = null;
          }
        }
      ],
      cssClass: 'custom-action-sheet'
    });

    // Guardamos la referencia al action-sheet actual
    this.currentActionSheet = actionSheet;

    // Cuando se cierre el action-sheet, limpiamos la referencia
    actionSheet.onDidDismiss().then(() => {
      this.currentActionSheet = null;
    });

    // Agregamos un listener para el backdrop
    document.addEventListener('click', this.handleBackdropClick.bind(this));

    await actionSheet.present();
  }

  private handleBackdropClick(event: MouseEvent) {
    if (this.currentActionSheet) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('action-sheet-backdrop')) {
        this.currentActionSheet.dismiss();
        this.currentActionSheet = null;
      }
    }
  }

  ngOnDestroy() {
    // Limpiamos el listener cuando el componente se destruye
    document.removeEventListener('click', this.handleBackdropClick.bind(this));
  }

  getSelectedTipoText(): string {
    const tipoId = this.suscripcionForm.get('tipo')?.value;
    const tipo = this.tiposSuscripcion.find(t => t.id === tipoId);
    return tipo ? `${tipo.nombre} - ${tipo.precio}€` : '';
  }
} 