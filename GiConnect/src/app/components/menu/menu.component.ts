import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { menuOutline } from 'ionicons/icons';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-menu type="overlay" side="top" menuId="main-menu" contentId="main-content" [swipeGesture]="true">
      <ion-content>
        <ion-list>
          <ion-item>
            <ion-label>Inicio</ion-label>
          </ion-item>
          <ion-item>
            <ion-label>Perfil</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>
  `,
  styles: [`
    ion-menu {
      --width: 100%;
      --height: 300px;
      --background: white;
    }
    ion-list {
      padding: 20px 0;
    }
    ion-item {
      --padding-start: 20px;
      --padding-end: 20px;
      --min-height: 50px;
    }
  `]
})
export class MenuComponent {
  constructor() {
    addIcons({ menuOutline });
  }
} 