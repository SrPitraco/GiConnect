import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule
  ]
})
export class ForgotPasswordPage {
  forgotPasswordForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async showAlert(message: string, isSuccess: boolean = false) {
    const alert = await this.alertController.create({
      header: isSuccess ? 'Éxito' : 'Error',
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            if (isSuccess) {
              this.router.navigate(['/auth/reset-password'], { 
                queryParams: { email: this.forgotPasswordForm.get('email')?.value }
              });
            } else {
              this.router.navigate(['/auth/login']);
            }
          }
        }
      ],
      cssClass: 'custom-alert'
    });

    await alert.present();
  }

  async showToast(message: string, color: string = 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color
    });
    await toast.present();
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      const email = this.forgotPasswordForm.get('email')?.value;

      this.authService.requestPasswordReset(email).subscribe({
        next: (response) => {
          this.loading = false;
          this.showAlert('Se ha enviado un código de verificación a tu email', true);
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          console.error('Error completo:', error);
          
          if (error.status === 404) {
            this.showAlert('No existe un usuario con esta cuenta');
          } else if (error.status === 0) {
            this.errorMessage = 'No se pudo conectar con el servidor';
            this.showToast('No se pudo conectar con el servidor');
          } else {
            this.errorMessage = 'Ha ocurrido un error. Por favor, intenta de nuevo';
            this.showToast('Ha ocurrido un error. Por favor, intenta de nuevo');
          }
        }
      });
    }
  }
} 