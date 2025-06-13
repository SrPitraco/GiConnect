import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, AlertController, LoadingController, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../interfaces/user.interface';
import { addIcons } from 'ionicons';
import { personOutline, calendarOutline, createOutline, saveOutline } from 'ionicons/icons';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';

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

const CINTURONES = [
  'Blanco', 'Gris', 'Blanco-Amarillo', 'Amarillo', 'Amarillo-Naranja',
  'Naranja', 'Naranja-Verde', 'Verde', 'Verde-Azul', 'Azul', 'Morado',
  'Marrón', 'Negro', 'Negro-Rojo', 'Rojo-Blanco', 'Rojo'
];

const GRADOS = [0, 1, 2, 3, 4];

@Component({
  selector: 'app-editar-usuario',
  templateUrl: './editar-usuario.page.html',
  styleUrls: ['./editar-usuario.page.scss'],
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
    { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_FORMAT },
  ]
})
export class EditarUsuarioPage implements OnInit {
  usuarioForm: FormGroup;
  usuario: User | null = null;
  isAdmin = false;
  isMaestro = false;
  cinturones = CINTURONES;
  grados = GRADOS;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private navController: NavController
  ) {
    this.usuarioForm = this.fb.group({
      foto: [''],
      nombre: ['', Validators.required],
      apellido1: ['', Validators.required],
      apellido2: [''],
      dni: ['', [Validators.required, Validators.pattern(/^[0-9]{8}[A-Za-z]$/)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      numIBJJF: [''],
      fechaInicio: [null],
      cinturon: [''],
      grado: [0],
      fechaDesde: [null],
      clasesAsistidas: [0],
      clasesImpartidas: [0],
      activo: [true]
    });

    
  }

  ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId) {
      this.router.navigate(['/modificar-usuario']);
      return;
    }

    const currentUser = this.authService.getUser();
    this.isAdmin = currentUser?.role === 'admin';
    this.isMaestro = currentUser?.role === 'maestro';

    this.loadUsuario(userId);
  }

  private loadUsuario(userId: string) {
    this.isLoading = true;
    this.userService.getUserById(userId).subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        this.usuarioForm.patchValue({
          ...usuario,
          fechaInicio: usuario.fechaInicio ? new Date(usuario.fechaInicio) : null,
          fechaDesde: usuario.fechaDesde ? new Date(usuario.fechaDesde) : null
        });

        if (this.isMaestro) {
          // Si es maestro, solo permite editar ciertos campos
          this.usuarioForm.get('fechaInicio')?.enable();
          this.usuarioForm.get('cinturon')?.enable();
          this.usuarioForm.get('grado')?.enable();
          this.usuarioForm.get('fechaDesde')?.enable();
          this.usuarioForm.get('clasesAsistidas')?.enable();
          this.usuarioForm.get('clasesImpartidas')?.enable();

          // Deshabilitar el resto de campos
          Object.keys(this.usuarioForm.controls).forEach(key => {
            if (!['fechaInicio', 'cinturon', 'grado', 'fechaDesde', 'clasesAsistidas', 'clasesImpartidas'].includes(key)) {
              this.usuarioForm.get(key)?.disable();
            }
          });
        }
        this.isLoading = false;
      },
      error: async (error) => {
        console.error('Error al cargar usuario:', error);
        this.isLoading = false;
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'No se pudo cargar la información del usuario',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  async onSubmit() {
    if (this.usuarioForm.valid && this.usuario && this.usuario._id) {
      const loading = await this.loadingController.create({
        message: 'Guardando cambios...',
        spinner: 'circular'
      });
      await loading.present();

      try {
        const formData = this.usuarioForm.value;
        const updatedUser: Partial<User> = {};

        if (this.isAdmin) {
          // Si es admin, puede actualizar todos los campos
          Object.assign(updatedUser, formData);
        } else {
          // Si es maestro, solo puede actualizar campos específicos
          updatedUser.fechaInicio = formData.fechaInicio;
          updatedUser.cinturon = formData.cinturon;
          updatedUser.grado = formData.grado;
          updatedUser.fechaDesde = formData.fechaDesde;
          updatedUser.clasesAsistidas = formData.clasesAsistidas;
          updatedUser.clasesImpartidas = formData.clasesImpartidas;
        }

        this.userService.updateUser(this.usuario._id, updatedUser).subscribe({
          next: async () => {
            const alert = await this.alertController.create({
              header: 'Éxito',
              message: 'Usuario actualizado correctamente',
              buttons: [],
              backdropDismiss: false
            });
            await alert.present();

            setTimeout(() => {
              alert.dismiss();
              this.router.navigate(['/teacher/modificar-usuario']);
            }, 2000);
          },
          error: async (error) => {
            console.error('Error al actualizar usuario:', error);
            const alert = await this.alertController.create({
              header: 'Error',
              message: 'No se pudo actualizar el usuario. Por favor, inténtalo de nuevo.',
              buttons: ['OK']
            });
            await alert.present();
          },
          complete: () => {
            loading.dismiss();
          }
        });
      } catch (error) {
        console.error('Error al actualizar usuario:', error);
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'No se pudo actualizar el usuario. Por favor, inténtalo de nuevo.',
          buttons: ['OK']
        });
        await alert.present();
        await loading.dismiss();
      }
    }
  }

  resetClasesAsistidas() {
    this.usuarioForm.patchValue({ clasesAsistidas: 0 });
  }

  resetClasesImpartidas() {
    this.usuarioForm.patchValue({ clasesImpartidas: 0 });
  }
}

addIcons({ personOutline, calendarOutline, createOutline, saveOutline }); 