import { Injectable } from '@angular/core';
import { Database, ref, push, onValue, query, limitToLast } from 'firebase/database';
import { BehaviorSubject } from 'rxjs';
import { DataSnapshot } from 'firebase/database';
import { getDatabase } from 'firebase/database';

export interface ChatMessage {
  user: string;
  message: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private messages$ = new BehaviorSubject<ChatMessage[]>([]);
  private db: Database;

  constructor() {
    this.db = getDatabase();
    this.listenForMessages();
  }

  private listenForMessages() {
    const messagesRef = query(ref(this.db, 'chat/messages'), limitToLast(50));
    onValue(messagesRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val() || {};
      const formatted = Object.values(data) as ChatMessage[];
      this.messages$.next(formatted);
    });
  }

  getMessages() {
    return this.messages$.asObservable();
  }

  sendMessage(user: string, message: string) {
    const messagesRef = ref(this.db, 'chat/messages');
    const newMessage: ChatMessage = {
      user,
      message,
      timestamp: Date.now(),
    };
    push(messagesRef, newMessage);
  }
}
