import { Component, Input } from '@angular/core';
import { IonicModule, PopoverController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'app-instructor-popover',
  template: `
    <ion-list>
      <ion-item *ngFor="let instructor of instructores" 
                (click)="seleccionarInstructor(instructor)"
                class="instructor-item">
        <ion-label>
          {{instructor.nombre}} {{instructor.apellido1}}
        </ion-label>
      </ion-item>
    </ion-list>
  `,
  styles: [`
    .instructor-item {
      --padding-start: 16px;
      --padding-end: 16px;
      --padding-top: 12px;
      --padding-bottom: 12px;
      --min-height: 48px;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class InstructorPopoverComponent {
  @Input() instructores: User[] = [];

  constructor(private popoverCtrl: PopoverController) {}

  seleccionarInstructor(instructor: User) {
    this.popoverCtrl.dismiss(instructor);
  }
} 