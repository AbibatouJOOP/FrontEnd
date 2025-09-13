import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface ChatMessage {
  id?: number;
  client_id: number;
  employe_id?: number;
  message: string;
  est_lu?: boolean;
  emeteur_type: 'CLIENT' | 'EMPLOYE' | 'ADMIN';
  emeteur_id: number;
  created_at?: string;
  sender?: {
    id: number;
    nomComplet: string;
    email: string;
  };
  client?: {
    id: number;
    nomComplet: string;
    email: string;
  };
  employe?: {
    id: number;
    nomComplet: string;
    email: string;
  };
}

export interface Conversation {
  client_id: number;
  client: {
    id: number;
    nomComplet: string;
    email: string;
  };
  last_message_date: string;
  message_count: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://127.0.0.1:8000/api/chats';
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  
  public messages$ = this.messagesSubject.asObservable();
  public conversations$ = this.conversationsSubject.asObservable();

  constructor(private http: HttpClient) {
    // Polling pour récupérer les nouveaux messages toutes les 3 secondes
    interval(3000).pipe(
      switchMap(() => this.getMessagesFromAPI()),
      catchError(error => {
        console.error('Erreur lors du polling:', error);
        return of([]);
      })
    ).subscribe(messages => {
      this.messagesSubject.next(messages);
    });

    // Polling pour les conversations
    interval(5000).pipe(
      switchMap(() => this.getConversationsFromAPI()),
      catchError(error => {
        console.error('Erreur lors du polling des conversations:', error);
        return of([]);
      })
    ).subscribe(conversations => {
      this.conversationsSubject.next(conversations);
    });
  }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }


  private getMessagesFromAPI(): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(this.apiUrl, this.getHttpOptions());
  }

  private getConversationsFromAPI(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`, this.getHttpOptions());
  }

  // Récupérer tous les messages
  getMessages(): Observable<ChatMessage[]> {
    return this.getMessagesFromAPI();
  }

  // Récupérer la liste des conversations
  getConversations(): Observable<Conversation[]> {
    return this.getConversationsFromAPI();
  }

  // Récupérer les messages d'un client spécifique
  getClientMessages(clientId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/client/${clientId}`, this.getHttpOptions());
  }

  // Récupérer les messages d'une conversation spécifique
  getMessagesByConversation(clientId: number, employeId?: number): Observable<ChatMessage[]> {
    const url = employeId 
      ? `${this.apiUrl}/conversation/${clientId}/${employeId}`
      : `${this.apiUrl}/client/${clientId}`;
    return this.http.get<ChatMessage[]>(url, this.getHttpOptions());
  }

  // Envoyer un message
  sendMessage(message: Partial<ChatMessage>): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(this.apiUrl, message, this.getHttpOptions());
  }

  // Répondre à un client (pour employés/admin)
  replyToClient(clientId: number, message: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(
      `${this.apiUrl}/reply/${clientId}`, 
      { message }, 
      this.getHttpOptions()
    );
  }

  // Supprimer un message
  deleteMessage(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }

  // Marquer un message comme lu
  markAsRead(id: number): Observable<ChatMessage> {
    return this.http.put<ChatMessage>(`${this.apiUrl}/${id}`, { est_lu: true }, this.getHttpOptions());
  }

  // Marquer une conversation comme lue
  markConversationAsRead(clientId: number, employeId?: number): Observable<any> {
    const payload = employeId ? { employe_id: employeId } : {};
    return this.http.put(`${this.apiUrl}/conversation/${clientId}/read`, payload, this.getHttpOptions());
  }

  // Récupérer le nombre de messages non lus
  getUnreadCount(): Observable<{unread_count: number}> {
    return this.http.get<{unread_count: number}>(`${this.apiUrl}/unread-count`, this.getHttpOptions());
  }

  // Assigner un employé à une conversation
  assignEmployee(clientId: number, employeId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/assign/${clientId}`, 
      { employe_id: employeId }, 
      this.getHttpOptions()
    );
  }

  // Méthodes utilitaires
  isOwnMessage(message: ChatMessage, currentUserId: number): boolean {
    return message.emeteur_id === currentUserId;
  }

  getMessageSenderName(message: ChatMessage): string {
    if (message.sender) {
      return message.sender.nomComplet;
    }
    return message.emeteur_type === 'CLIENT' ? 'Client' : 
           message.emeteur_type === 'ADMIN' ? 'Administrateur' : 'Employé';
  }
}