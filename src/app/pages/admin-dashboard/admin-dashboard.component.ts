import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  currentUser: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // CORRECTION: S'abonner aux changements de l'utilisateur
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      // AJOUT: Vérifier si l'utilisateur a le bon rôle
      if (user && user.role !== 'ADMIN') {
        this.router.navigate(['/unauthorized']);
      }
    });

    // Charger l'utilisateur si pas encore fait
    if (!this.currentUser && this.authService.isAuthenticated()) {
      this.authService.loadUser().subscribe();
    }
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  isEmploye(): boolean {
    return this.authService.hasRole('EMPLOYE');
  }

  isClient(): boolean {
    return this.authService.hasRole('CLIENT');
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Même en cas d'erreur, on déconnecte localement
        this.authService.removeToken();
        this.router.navigate(['/login']);
      }
    });
  }
}