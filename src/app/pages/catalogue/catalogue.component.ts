import { Component } from '@angular/core';
import { Produit } from '../../models/produit';
import { PanierService } from '../../services/panier.service';
import { ProduitService } from '../../services/produit.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Promotion } from '../../models/promotion';
import { PromotionService } from '../../services/promotion.service';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './catalogue.component.html',
  styleUrl: './catalogue.component.css'
})
export class CatalogueComponent {
  produits: Produit[] = [];
  loading: boolean = true;
  produitSelectionne: Produit | null = null;
  promotions: Promotion[] = [];
  promotionsActives: Promotion[] = [];
  loadingPromos: boolean = true;


  constructor(
    private produitService: ProduitService,
    public panierService: PanierService,
    private authService: AuthService,
    private promotionService: PromotionService
  ) {}

 ngOnInit() {
    this.loadingPromos = true;

    this.promotionService.getActive().subscribe({
      next: (data) => {
        this.promotionsActives = data; 
        this.loadingPromos = false;
      },
      error: (err) => {
        console.error("Erreur lors du chargement des promotions actives :", err);
        this.promotionsActives = [];
        this.loadingPromos = false;
      }
    });

    this.chargerProduits();
  }


    

  chargerProduits() {
    this.loading = true;
    
    // Attendre que l'utilisateur soit chargé, puis charger les produits
    this.authService.waitForUserLoaded().subscribe({
      next: (user) => {
        console.log('Utilisateur pour catalogue:', user);
        
        // Utiliser getAllForClient() spécifiquement pour les clients
        this.produitService.getAllForClient().subscribe({
          next: (produits) => {
            this.produits = produits;
            this.loading = false;
            console.log('Produits chargés pour client:', produits);
          },
          error: (error) => {
            console.error('Erreur lors du chargement des produits:', error);
            this.loading = false;
            
            // Affichage d'un message d'erreur plus détaillé
            if (error.status === 403) {
              console.error('Accès refusé - Vérifiez vos permissions');
              alert('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
            } else if (error.status === 401) {
              console.error('Non authentifié - Reconnectez-vous');
              alert('Session expirée. Veuillez vous reconnecter.');
              // Rediriger vers login si nécessaire
            } else {
              console.error('Erreur serveur:', error.status, error.message);
              alert('Erreur lors du chargement des produits. Veuillez réessayer.');
            }
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        this.loading = false;
      }
    });
  }

  ajouterAuPanier(produit: Produit) {
    if (!this.panierService.estDansPanier(produit.id)) {
      this.panierService.ajouterProduit(produit, 1);
      
      // Animation de confirmation (optionnel)
      const button = event?.target as HTMLElement;
      if (button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
          button.style.transform = 'scale(1)';
        }, 150);
      }
    }
  }

  voirDetails(produit: Produit) {
    this.produitSelectionne = produit;
  }

  fermerDetails() {
    this.produitSelectionne = null;
  }
}
