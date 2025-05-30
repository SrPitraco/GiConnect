import { Component, OnInit } from '@angular/core';
import {
  IonicModule,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  AlertController,
  IonSpinner
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Marcar los campos como touched cuando el usuario interactúa con ellos
    this.loginForm.get('email')?.valueChanges.subscribe(() => {
      this.loginForm.get('email')?.markAsTouched();
    });
    this.loginForm.get('password')?.valueChanges.subscribe(() => {
      this.loginForm.get('password')?.markAsTouched();
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      try {
        console.log('📝 Intentando login con:', this.loginForm.value);
        await this.authService.login(this.loginForm.value);
        console.log('✅ Login exitoso');
        this.router.navigate(['/home']);
      } catch (error: any) {
        console.error('❌ Error en login:', error);
        const alert = await this.alertController.create({
          header: 'Error',
          message: error.message || 'Error al iniciar sesión',
          buttons: ['OK'],
          cssClass: 'error-alert'
        });
        await alert.present();
      } finally {
        this.isLoading = false;
      }
    } else {
      console.log('❌ Formulario inválido:', this.loginForm.errors);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Por favor, completa todos los campos',
        buttons: ['OK'],
        cssClass: 'error-alert'
      });
      await alert.present();
    }
  }

  /** Puedes ajustar este método para tu flujo de recuperación */
  async forgotPassword() {
    const alert = await this.alertController.create({
      header: 'Recuperar contraseña',
      message: `Para recuperar tu contraseña, por favor ponte en contacto con el administrador o envía un correo a soporte@tudominio.com.`,
      buttons: ['OK']
    });
    await alert.present();
  }
}
