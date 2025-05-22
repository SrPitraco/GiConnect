import { Component } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  templateUrl: './login.page.html'
})
export class LoginPage {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async submit() {
    if (this.loginForm.invalid) {
      return;
    }
    this.auth.login(this.loginForm.value).subscribe({
      next: async () => {
        await this.router.navigateByUrl('/clases', { replaceUrl: true });
      },
      error: async err => {
        const t = await this.toast.create({
          message: err.error?.error || 'Login fallido',
          duration: 2000,
          color: 'danger'
        });
        await t.present();
      }
    });
  }
}
