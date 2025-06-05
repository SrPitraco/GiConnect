import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, Platform, AlertController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { createOutline, cameraOutline, saveOutline } from 'ionicons/icons';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from '../../services/auth.service';
import { SuscripcionService } from '../../services/suscripcion.service';
import { Suscripcion } from '../../interfaces/suscripcion.interface';

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
  activeSubscription: Suscripcion | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private alertController: AlertController,
    private toastController: ToastController,
    private platform: Platform,
    private authService: AuthService,
    private suscripcionService: SuscripcionService
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
    console.log('Cargando suscripciones activas...');
    this.suscripcionService.getSuscripcionesActivas().subscribe({
      next: (suscripciones: Suscripcion[]) => {
        console.log('Suscripciones recibidas:', suscripciones);
        if (suscripciones && suscripciones.length > 0) {
          // Ordenar por fecha de fin y tomar la más reciente
          suscripciones.sort((a, b) => new Date(b.fechaFin).getTime() - new Date(a.fechaFin).getTime());
          this.activeSubscription = suscripciones[0];
          console.log('Suscripción activa:', this.activeSubscription);
        } else {
          this.activeSubscription = null;
          console.log('No hay suscripciones activas');
        }
      },
      error: (error) => {
        console.error('Error al cargar suscripciones:', error);
        this.activeSubscription = null;
      }
    });
  }

  isSubscriptionExpired(): boolean {
    if (!this.activeSubscription) return true;
    const fechaFin = new Date(this.activeSubscription.fechaFin);
    const hoy = new Date();
    return fechaFin < hoy;
  }

  getSubscriptionStatus(): string {
    if (!this.activeSubscription) {
      return 'Sin suscripción activa';
    }
    if (this.isSubscriptionExpired()) {
      return 'Suscripción expirada';
    }
    return `Suscripción ${this.activeSubscription.tipo} activa hasta ${new Date(this.activeSubscription.fechaFin).toLocaleDateString('es-ES')}`;
  }

  getRoleName(role: string): string {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'Administrador';
      case 'maestro':
        return 'Maestro';
      case 'instructor':
        return 'Instructor';
      case 'atleta':
        return 'Atleta';
      default:
        console.warn('Rol no reconocido:', role);
        return 'Usuario';
    }
  }

  async updateField(field: keyof UserData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const response = await this.http.put(
        `${environment.apiUrl}/users/${field}`,
        { [field]: this.userData[field] },
        { headers }
      ).toPromise();

      // Actualizar el localStorage
      const userInfo = localStorage.getItem('user');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        user[field] = this.userData[field];
        localStorage.setItem('user', JSON.stringify(user));
      }

      this.presentToast('Campo actualizado correctamente');
    } catch (error) {
      console.error(`Error al actualizar ${field}:`, error);
      this.presentToast(`Error al actualizar ${field}`);
    }
  }

  async changePhoto() {
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
        ],
        backdropDismiss: true
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

  private async handleFile(file: File) {
    try {
      const base64 = await this.fileToBase64(file);
      await this.updateUserPhoto(base64);
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

  private async updateUserPhoto(base64Image: string) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Comprimir la imagen antes de enviarla
      const compressedImage = await this.authService.compressImage(base64Image);
      console.log('Tamaño de la imagen comprimida:', compressedImage.length);

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const response = await this.http.put(
        `${environment.apiUrl}/users/me/photo`,
        { foto: compressedImage },
        { headers }
      ).toPromise();

      // Actualizar la foto en el localStorage
      const userInfo = localStorage.getItem('user');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        user.foto = compressedImage;
        localStorage.setItem('user', JSON.stringify(user));
        this.userPhoto = compressedImage;
      }

      this.presentToast('Foto actualizada correctamente');
    } catch (error: any) {
      console.error('Error al actualizar la foto:', error);
      if (error.status === 413) {
        this.presentToast('La imagen es demasiado grande. Por favor, selecciona una imagen más pequeña.');
      } else {
        this.presentToast(error.error?.error || 'Error al actualizar la foto. Por favor, inténtalo de nuevo.');
      }
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
        await this.updateUserPhoto(base64Image);
        console.log('Imagen procesada y enviada al servidor');
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
        await this.updateUserPhoto(base64Image);
        console.log('Imagen procesada y enviada al servidor');
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
} 