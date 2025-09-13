import { CommonModule,CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Produit } from '../../models/produit';
import { ProduitService } from '../../services/produit.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-produit',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterModule,
    FormsModule
    
  ],
  templateUrl: './produit.component.html',
  styleUrl: './produit.component.css'
})
export class ProduitComponent {
produits: Produit[] = [];
  isLoading = true;
  error: string | null = null;
  currentUser: any;

  Math = Math;
  
  // Nouveaux états pour la gestion des stocks
  showRestockModal = false;
  selectedProduit: Produit | null = null;
  restockQuantity = 0;
  isRestocking = false;
  stockStatistics: any = null;
  showStockFilter = false;
  stockFilter = 'tous'; // tous, critique, faible, moyen, bon

  constructor(
    private produitService: ProduitService,
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    // S'assurer que l'utilisateur est chargé avant d'accéder aux produits
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        console.log('Utilisateur connecté:', user);
        console.log('Rôle utilisateur:', user.role);
        this.getAll();
        if (this.canManageProducts()) {
          this.loadStockStatistics();
        }
      } else if (this.authService.isAuthenticated()) {
        // L'utilisateur est authentifié mais pas encore chargé, attendre
        this.authService.waitForUserLoaded().subscribe({
          next: (loadedUser) => {
            this.currentUser = loadedUser;
            if (loadedUser) {
              this.getAll();
              if (this.canManageProducts()) {
                this.loadStockStatistics();
              }
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
        } else {
          this.error = 'Erreur lors du chargement des produits.';
        }
      }
    });
  }

  loadStockStatistics(): void {
    this.produitService.getStockStatistics().subscribe({
      next: (stats) => {
        this.stockStatistics = stats;
        console.log('Statistiques de stock:', stats);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
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
          this.loadStockStatistics(); // Recharger les stats
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression du produit.');
        }
      });
    }
  }

  // NOUVELLES MÉTHODES POUR LA GESTION DES STOCKS

  openRestockModal(produit: Produit): void {
    this.selectedProduit = produit;
    this.restockQuantity = 10; // Valeur par défaut
    this.showRestockModal = true;
  }

  closeRestockModal(): void {
    this.showRestockModal = false;
    this.selectedProduit = null;
    this.restockQuantity = 0;
    this.isRestocking = false;
  }

  confirmRestock(): void {
    if (!this.selectedProduit || this.restockQuantity <= 0) {
      alert('Veuillez saisir une quantité valide.');
      return;
    }

    this.isRestocking = true;
    this.produitService.restockProduit(this.selectedProduit.id, this.restockQuantity).subscribe({
      next: (response) => {
        console.log('Produit réapprovisionné:', response);
        alert(response.message);
        this.getAll(); // Recharger la liste
        this.loadStockStatistics(); // Recharger les stats
        this.closeRestockModal();
      },
      error: (error) => {
        console.error('Erreur lors du réapprovisionnement:', error);
        alert('Erreur lors du réapprovisionnement du produit.');
        this.isRestocking = false;
      }
    });
  }

  getStockStatusClass(produit: any): string {
    return this.produitService.getStockStatusClass(produit.stock_status);
  }

  getStockIcon(produit: any): string {
    return this.produitService.getStockIcon(produit.stock_status);
  }

  // Filtrage par statut de stock
  getFilteredProduits(): Produit[] {
    if (this.stockFilter === 'tous') {
      return this.produits;
    }
    return this.produits.filter(produit => (produit as any).stock_status === this.stockFilter);
  }

  getFilterButtonClass(filter: string): string {
    return this.stockFilter === filter ? 'btn-primary' : 'btn-outline-primary';
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

  // Méthodes utilitaires pour l'affichage
  getStockBadgeClass(stock: number): string {
    if (stock <= 0) return 'badge bg-danger';
    if (stock <= 5) return 'badge bg-warning';
    if (stock <= 10) return 'badge bg-info';
    return 'badge bg-success';
  }

  getStockText(stock: number): string {
    if (stock <= 0) return 'Épuisé';
    if (stock <= 5) return 'Faible';
    if (stock <= 10) return 'Moyen';
    return 'Bon';
  }
}