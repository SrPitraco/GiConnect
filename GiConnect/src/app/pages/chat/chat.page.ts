import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonList, IonLabel, IonButton, IonFooter } from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { ChatMessage, ChatService } from 'src/app/services/chat.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { IonInput } from '@ionic/angular/standalone'; 

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [IonFooter, IonButton, IonLabel, IonList, IonItem, IonContent, IonHeader, IonTitle, IonToolbar, IonInput, CommonModule, FormsModule]
})
export class ChatPage {
  messages$: Observable<ChatMessage[]>;
  user = 'Usuario1'; // puedes obtenerlo de auth
  newMessage = '';

  constructor(private chatService: ChatService, private userStateService: UserStateService) {
    this.messages$ = this.chatService.getMessages();
    this.user = this.userStateService.getCurrentUser().nombre;
  }

  send() {
    if (this.newMessage.trim()) {
      this.chatService.sendMessage(this.user, this.newMessage.trim());
      this.newMessage = '';
    }
  }
}
