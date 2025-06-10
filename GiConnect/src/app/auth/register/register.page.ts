import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Platform } from '@ionic/angular';
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
    private loadingController: LoadingController,
    private platform: Platform
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
    if (this.platform.is('hybrid')) {
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
    } else {
      // En web, usamos el input file
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
          this.handleFile(file);
        }
      };
      input.click();
    }
  }

  async takePicture() {
    try {
      console.log('Iniciando captura de foto');
      
      // Verificar permisos específicamente para la cámara
      const permissionStatus = await Camera.checkPermissions();
      console.log('Estado de permisos:', permissionStatus);
      
      if (permissionStatus.camera !== 'granted') {
        console.log('Solicitando permisos de cámara');
        const requestResult = await Camera.requestPermissions({
          permissions: ['camera']
        });
        console.log('Resultado de solicitud de permisos:', requestResult);
        
        if (requestResult.camera !== 'granted') {
          this.presentToast('Se necesita permiso para acceder a la cámara');
          return;
        }
      }

      console.log('Configurando opciones de la cámara');
      const options: any = {
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        correctOrientation: true
      };
      
      console.log('Opciones de la cámara:', options);
      console.log('Intentando obtener foto');
      
      const image = await Camera.getPhoto(options);
      console.log('Foto obtenida:', image);

      if (image.base64String) {
        console.log('Procesando imagen base64');
        const base64Image = `data:image/${image.format};base64,${image.base64String}`;
        this.registerForm.patchValue({
          foto: base64Image
        });
        console.log('Imagen procesada y asignada al formulario');
      }
    } catch (error: any) {
      console.error('Error detallado al tomar la foto:', error);
      if (error.message === 'User cancelled photos app' || error.message === 'User cancelled photos') {
        console.log('Usuario canceló la captura');
        return;
      }
      this.presentToast('Error al tomar la foto. Por favor, inténtalo de nuevo.');
    }
  }

  async pickFromGallery() {
    try {
      console.log('Iniciando selección de foto desde galería');
      
      // Verificar permisos específicamente para la galería
      const permissionStatus = await Camera.checkPermissions();
      console.log('Estado de permisos:', permissionStatus);
      
      if (permissionStatus.photos !== 'granted') {
        console.log('Solicitando permisos de galería');
        const requestResult = await Camera.requestPermissions({
          permissions: ['photos']
        });
        console.log('Resultado de solicitud de permisos:', requestResult);
        
        if (requestResult.photos !== 'granted') {
          this.presentToast('Se necesita permiso para acceder a la galería');
          return;
        }
      }

      console.log('Configurando opciones de la galería');
      const options: any = {
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
        correctOrientation: true
      };
      
      console.log('Opciones de la galería:', options);
      console.log('Intentando obtener foto');
      
      const image = await Camera.getPhoto(options);
      console.log('Foto obtenida:', image);

      if (image.base64String) {
        console.log('Procesando imagen base64');
        const base64Image = `data:image/${image.format};base64,${image.base64String}`;
        this.registerForm.patchValue({
          foto: base64Image
        });
        console.log('Imagen procesada y asignada al formulario');
      }
    } catch (error: any) {
      console.error('Error detallado al seleccionar la foto:', error);
      if (error.message === 'User cancelled photos app' || error.message === 'User cancelled photos') {
        console.log('Usuario canceló la selección');
        return;
      }
      this.presentToast('Error al seleccionar la foto. Por favor, inténtalo de nuevo.');
    }
  }

  private async handleFile(file: File) {
    try {
      const base64 = await this.fileToBase64(file);
      const compressedImage = await this.authService.compressImage(base64);
      this.photoUrl = compressedImage;
      this.registerForm.patchValue({ foto: compressedImage });
    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      this.presentToast('Error al procesar la imagen');
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
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
        
        const toast = await this.toastController.create({
          message: 'Tu cuenta ha sido creada correctamente',
          duration: 3000,
          position: 'middle',
          cssClass: 'success-toast'
        });
        await toast.present();
        
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
      position: 'middle',
      cssClass: 'success-toast'
    });
    await toast.present();
  }
}
