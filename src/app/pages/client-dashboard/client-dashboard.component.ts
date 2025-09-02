import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { PanierService } from '../../services/panier.service';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule
  ],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.css'
})
export class ClientDashboardComponent {
  nombreProduitsPanier: number = 0;
  
  constructor(
    private panierService: PanierService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // S'abonner aux changements du panier
    this.panierService.getNombreProduits().subscribe(nombre => {
      this.nombreProduitsPanier = nombre;
    });
  }


  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion:', error);
        // Rediriger quand même vers login même en cas d'erreur
        this.router.navigate(['/login']);
      }
    });
  }
}
