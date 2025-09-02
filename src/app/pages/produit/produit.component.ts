import { CommonModule,CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Produit } from '../../models/produit';
import { ProduitService } from '../../services/produit.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-produit',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterModule,
    
  ],
  templateUrl: './produit.component.html',
  styleUrl: './produit.component.css'
})
export class ProduitComponent {
 produits: Produit[] = [];
  isLoading = true;
  error: string | null = null;
  currentUser: any;

  constructor(
    private produitService: ProduitService,
    private authService: AuthService,
    public router: Router // CORRECTION: Rendre router public pour le template
  ) {}

  ngOnInit(): void {
    // S'assurer que l'utilisateur est chargé avant d'accéder aux produits
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        console.log('Utilisateur connecté:', user);
        console.log('Rôle utilisateur:', user.role);
        this.getAll();
      } else if (this.authService.isAuthenticated()) {
        // L'utilisateur est authentifié mais pas encore chargé, attendre
        this.authService.waitForUserLoaded().subscribe({
          next: (loadedUser) => {
            this.currentUser = loadedUser;
            if (loadedUser) {
              this.getAll();
            }
          },
          error: (err) => {
            console.error('Erreur chargement utilisateur:', err);
            this.router.navigate(['/login']);
          }
        });
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  getAll(): void {
    this.isLoading = true;
    this.error = null;

    this.produitService.getAll().subscribe({
      next: (data: Produit[]) => {
        this.produits = data;
        this.isLoading = false;
        console.log('Produits récupérés:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur lors de la récupération des produits:', error);
        
        if (error.status === 403) {
          this.error = `Accès refusé. Votre rôle (${this.currentUser?.role}) ne permet pas d'accéder aux produits.`;
        } else if (error.status === 401) {
          this.error = 'Session expirée. Veuillez vous reconnecter.';
          // Pas besoin de naviguer ici, le bouton le fera
        } else {
          this.error = 'Erreur lors du chargement des produits.';
        }
      }
    });
  }

  deleteProduit(id: number): void {
    if (!this.canManageProducts()) {
      alert('Vous n\'avez pas les permissions pour supprimer ce produit.');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.produitService.deleteProduit(id).subscribe({
        next: () => {
          console.log('Produit supprimé');
          this.getAll(); // Recharger la liste
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression du produit.');
        }
      });
    }
  }

  // Méthodes pour vérifier les permissions
  canViewProducts(): boolean {
    return this.authService.hasAnyRole(['ADMIN', 'EMPLOYE', 'CLIENT']);
  }

  canManageProducts(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  canAddProduct(): boolean {
    return this.authService.hasRole('ADMIN');
  }
}