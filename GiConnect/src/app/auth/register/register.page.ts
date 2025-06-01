import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from '../../services/auth.service';
import { 
  ToastController, 
  ActionSheetController,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  AlertController,
  LoadingController,
  IonCard,
  IonCardTitle,
  IonNote,
  IonSpinner
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonCard,
    IonCardTitle,
    IonNote,
    IonSpinner
  ]
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  showPassword = false;
  photoUrl: string | null = null;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.registerForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      apellido1: ['', [Validators.required]],
      apellido2: [''],
      dni: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(9)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\+?\d{7,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      foto: [null]
    });
  }

  ngOnInit() {}

  async selectImageSource() {
    const alert = await this.alertController.create({
      header: 'Seleccionar fuente',
      cssClass: 'image-source-alert',
      buttons: [
        {
          text: 'Cámara',
          cssClass: 'alert-button',
          handler: () => {
            this.takePicture();
          }
        },
        {
          text: 'Galería',
          cssClass: 'alert-button',
          handler: () => {
            this.pickFromGallery();
          }
        },
        {
          text: 'Cancelar',
          cssClass: 'alert-button-cancel',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  async takePicture() {
    // Implementar lógica para tomar foto
  }

  async pickFromGallery() {
    // Implementar lógica para seleccionar de galería
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const loading = await this.loadingController.create({
        message: 'Registrando...'
      });
      await loading.present();

      try {
        await this.authService.register(this.registerForm.value);
        await loading.dismiss();
        this.isLoading = false;
        
        const alert = await this.alertController.create({
          header: 'Registro exitoso',
          message: 'Tu cuenta ha sido creada correctamente',
          buttons: ['OK']
        });
        await alert.present();
        
        this.router.navigate(['/auth/login']);
      } catch (error: any) {
        await loading.dismiss();
        this.isLoading = false;
        
        const alert = await this.alertController.create({
          header: 'Error',
          message: error.message || 'Ha ocurrido un error durante el registro',
          buttons: ['OK']
        });
        await alert.present();
      }
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  private async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}
