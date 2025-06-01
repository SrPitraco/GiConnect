import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule
  ]
})
export class ResetPasswordPage implements OnInit {
  resetPasswordForm: FormGroup;
  loading = false;
  email: string = '';
  codeVerified = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController
  ) {
    this.resetPasswordForm = this.fb.group({
      code: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.email = this.route.snapshot.queryParams['email'];
    if (!this.email) {
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  verifyCode() {
    if (this.resetPasswordForm.get('code')?.valid) {
      this.loading = true;
      const code = this.resetPasswordForm.get('code')?.value;

      // Aquí podríamos hacer una verificación previa del código
      // Por ahora, simplemente marcamos como verificado
      this.codeVerified = true;
      this.loading = false;
    }
  }

  onSubmit() {
    if (this.resetPasswordForm.valid && this.codeVerified) {
      this.loading = true;
      const { code, newPassword } = this.resetPasswordForm.value;

      this.authService.resetPassword(this.email, code, newPassword).subscribe({
        next: (response) => {
          this.loading = false;
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error:', error);
        }
      });
    }
  }
} 