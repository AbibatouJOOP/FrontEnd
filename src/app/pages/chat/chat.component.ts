import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ChatService, ChatMessage, Conversation } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('chatBody') private chatBody!: ElementRef;

  messages: ChatMessage[] = [];
  conversations: Conversation[] = [];
  currentMessages: ChatMessage[] = [];
  newMessage: string = '';
  isLoading = false;
  error: string = '';

  currentUser: any;
  selectedClientId?: number;
  selectedEmployeId?: number;
  unreadCount = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private chatService: ChatService, 
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Attendre que l'utilisateur soit chargé
    const userSub = this.authService.waitForUserLoaded().subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.initializeChat();
        this.loadConversations();
        this.loadUnreadCount();
      }
    });
    this.subscriptions.push(userSub);

    // S'abonner aux messages en temps réel
    const messagesSub = this.chatService.messages$.subscribe(messages => {
      this.messages = messages;
      this.filterCurrentMessages();
    });
    this.subscriptions.push(messagesSub);

    // S'abonner aux conversations
    const conversationsSub = this.chatService.conversations$.subscribe(conversations => {
      this.conversations = conversations;
    });
    this.subscriptions.push(conversationsSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeChat(): void {
    if (this.currentUser.role === 'CLIENT') {
      // Pour un client, charger sa propre conversation
      this.selectedClientId = this.currentUser.id;
      this.loadCurrentConversation();
    }
    // Pour les employés et admins, ils sélectionneront une conversation
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  loadConversations(): void {
    if (this.currentUser.role !== 'CLIENT') {
      const convSub = this.chatService.getConversations().subscribe({
        next: (conversations) => {
          this.conversations = conversations;
        },
        error: (err) => {
          console.error('Erreur chargement conversations:', err);
        }
      });
      this.subscriptions.push(convSub);
    }
  }

  loadUnreadCount(): void {
    const countSub = this.chatService.getUnreadCount().subscribe({
      next: (response) => {
        this.unreadCount = response.unread_count;
      },
      error: (err) => {
        console.error('Erreur compteur messages non lus:', err);
      }
    });
    this.subscriptions.push(countSub);
  }

  selectConversation(clientId: number, employeId?: number): void {
    this.selectedClientId = clientId;
    this.selectedEmployeId = employeId;
    this.loadCurrentConversation();
    
    // Marquer la conversation comme lue
    this.markConversationAsRead();
  }

  loadCurrentConversation(): void {
    if (!this.selectedClientId) return;

    this.isLoading = true;
    this.error = '';

    const loadSub = this.chatService.getMessagesByConversation(
      this.selectedClientId, 
      this.selectedEmployeId
    ).subscribe({
      next: (messages) => {
        this.currentMessages = messages;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement conversation:', err);
        this.error = 'Erreur lors du chargement de la conversation';
        this.isLoading = false;
      }
    });
    this.subscriptions.push(loadSub);
  }

  private filterCurrentMessages(): void {
    if (this.selectedClientId) {
      this.currentMessages = this.messages.filter(msg => 
        msg.client_id === this.selectedClientId &&
        (!this.selectedEmployeId || msg.employe_id === this.selectedEmployeId)
      );
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedClientId) {
      return;
    }

    this.isLoading = true;
    this.error = '';

    let sendObservable;

    if (this.currentUser.role === 'CLIENT') {
      // Message du client
      const message: Partial<ChatMessage> = {
        client_id: this.selectedClientId,
        employe_id: this.selectedEmployeId,
        message: this.newMessage.trim(),
        emeteur_type: 'CLIENT',
        emeteur_id: this.currentUser.id
      };
      sendObservable = this.chatService.sendMessage(message);
    } else {
      // Réponse d'un employé/admin
      sendObservable = this.chatService.replyToClient(
        this.selectedClientId, 
        this.newMessage.trim()
      );
    }

    const sendSub = sendObservable.subscribe({
      next: (message) => {
        this.currentMessages.push(message);
        this.newMessage = '';
        this.isLoading = false;
        this.error = '';
      },
      error: (err) => {
        console.error('Erreur envoi message:', err);
        this.error = 'Erreur lors de l\'envoi du message';
        this.isLoading = false;
      }
    });
    this.subscriptions.push(sendSub);
  }

  deleteMessage(messageId?: number): void {
    if (!messageId) return;

    const deleteSub = this.chatService.deleteMessage(messageId).subscribe({
      next: () => {
        this.currentMessages = this.currentMessages.filter(m => m.id !== messageId);
      },
      error: (err) => {
        console.error('Erreur suppression:', err);
        this.error = 'Erreur lors de la suppression';
      }
    });
    this.subscriptions.push(deleteSub);
  }

  markAsRead(messageId?: number): void {
    if (!messageId) return;

    const readSub = this.chatService.markAsRead(messageId).subscribe({
      next: () => {
        this.currentMessages = this.currentMessages.map(m =>
          m.id === messageId ? { ...m, est_lu: true } : m
        );
      },
      error: (err) => {
        console.error('Erreur marquage:', err);
      }
    });
    this.subscriptions.push(readSub);
  }

  markConversationAsRead(): void {
    if (!this.selectedClientId) return;

    const markSub = this.chatService.markConversationAsRead(
      this.selectedClientId, 
      this.selectedEmployeId
    ).subscribe({
      next: () => {
        this.currentMessages = this.currentMessages.map(m => ({ ...m, est_lu: true }));
        this.loadUnreadCount(); // Recharger le compteur
      },
      error: (err) => console.error('Erreur marquage conversation:', err)
    });
    this.subscriptions.push(markSub);
  }

  private scrollToBottom(): void {
    try {
      if (this.chatBody?.nativeElement) {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Erreur scroll:', err);
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  }

  isOwnMessage(message: ChatMessage): boolean {
    return message.emeteur_id === this.currentUser.id;
  }

  getMessageSenderName(message: ChatMessage): string {
    return this.chatService.getMessageSenderName(message);
  }

  getSenderInitials(message: ChatMessage): string {
    if (message.sender?.nomComplet) {
      return message.sender.nomComplet.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return message.emeteur_type[0]; // C, E, ou A
  }

  trackByMessageId(index: number, message: ChatMessage): number | undefined {
    return message.id;
  }

  trackByConversationId(index: number, conversation: Conversation): number {
    return conversation.client_id;
  }

  canDeleteMessage(message: ChatMessage): boolean {
    // Seul l'expéditeur peut supprimer son message, ou un admin
    return this.isOwnMessage(message) || this.currentUser.role === 'ADMIN';
  }

  // Méthode pour les employés/admins pour assigner une conversation
  assignToMe(clientId: number): void {
    if (this.currentUser.role === 'CLIENT') return;

    const assignSub = this.chatService.assignEmployee(clientId, this.currentUser.id).subscribe({
      next: () => {
        this.selectedEmployeId = this.currentUser.id;
        this.loadCurrentConversation();
      },
      error: (err) => {
        console.error('Erreur assignation:', err);
        this.error = 'Erreur lors de l\'assignation';
      }
    });
    this.subscriptions.push(assignSub);
  }

  getClientName(clientId: number): string {
    const conversation = this.conversations.find(c => c.client_id === clientId);
    return conversation?.client?.nomComplet || 'Client';
  }

  getInitials(fullName: string | undefined): string {
    if (!fullName) return '';
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }


}