import { Component } from '@angular/core';
import { PromotionService } from '../../services/promotion.service';
import { Promotion } from '../../models/promotion';
import { AuthService } from '../../services/auth.service';
import { ProduitService } from '../../services/produit.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-promotion',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule
  ],
  templateUrl: './promotion.component.html',
  styleUrl: './promotion.component.css'
})
export class PromotionComponent {
promotions: Promotion[] = [];
  produits: any[] = [];
  loading = true;
  error = '';
  userRole: string | null = '';
  
  // Formulaire
  showForm = false;
  editingPromotion: Promotion | null = null;
  promotionForm: Partial<Promotion> = this.initializeForm();
  
  // Filtres et pagination
  filterActif = '';
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  
  // Gestion des produits associés
  selectedProduits: number[] = [];
  showProduitModal = false;
  currentPromotionId: number | null = null;
  
  // Statistiques
  statistics: any = null;

  constructor(
    private promotionService: PromotionService,
    private produitService: ProduitService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.getUserRole();
    this.loadPromotions();
    this.loadProduits();
  }

  getUserRole() {
    this.authService.waitForUserLoaded().subscribe({
      next: (user) => {
        if (user) {
          this.userRole = user.role;
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du rôle:', err);
        this.error = 'Erreur de connexion';
      }
    });
  }

  loadPromotions() {
    this.loading = true;
    this.error = '';
    
    this.promotionService.getAll().subscribe({
      next: (data) => {
        this.promotions = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des promotions:', err);
        this.error = err.message || 'Erreur lors du chargement des promotions';
        this.loading = false;
      }
    });
  }

  loadProduits() {
    this.produitService.getAll().subscribe({
      next: (data) => {
        this.produits = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des produits:', err);
      }
    });
  }

  

  // Gestion du formulaire
  initializeForm(): Partial<Promotion> {
    return {
      nom: '',
      description: '',
      reduction: 0,
      dateDebut: '',
      dateFin: '',
      actif: true
    };
  }

  openForm(promotion?: Promotion) {
    this.showForm = true;
    if (promotion) {
      this.editingPromotion = promotion;
      this.promotionForm = { ...promotion };
      // Formater les dates pour les inputs date
      if (promotion.dateDebut) {
        this.promotionForm.dateDebut = promotion.dateDebut.split('T')[0];
      }
      if (promotion.dateFin) {
        this.promotionForm.dateFin = promotion.dateFin.split('T')[0];
      }
    } else {
      this.editingPromotion = null;
      this.promotionForm = this.initializeForm();
      // Dates par défaut
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);
      
      this.promotionForm.dateDebut = today.toISOString().split('T')[0];
      this.promotionForm.dateFin = nextMonth.toISOString().split('T')[0];
    }
  }

  closeForm() {
    this.showForm = false;
    this.editingPromotion = null;
    this.promotionForm = this.initializeForm();
  }

  savePromotion() {
    if (!this.isFormValid()) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    const promotionData = { ...this.promotionForm };
    
    // Convertir les dates au bon format
    if (promotionData.dateDebut) {
      promotionData.dateDebut = new Date(promotionData.dateDebut).toISOString();
    }
    if (promotionData.dateFin) {
      promotionData.dateFin = new Date(promotionData.dateFin).toISOString();
    }

    const request = this.editingPromotion
      ? this.promotionService.update(this.editingPromotion.id, promotionData)
      : this.promotionService.create(promotionData);

    request.subscribe({
      next: (response) => {
        this.showSuccessMessage(
          this.editingPromotion ? 'Promotion modifiée avec succès' : 'Promotion créée avec succès'
        );
        this.closeForm();
        this.loadPromotions();
      },
      error: (err) => {
        console.error('Erreur lors de la sauvegarde:', err);
        this.error = err.error?.message || 'Erreur lors de la sauvegarde';
      }
    });
  }

  deletePromotion(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) {
      return;
    }

    this.promotionService.delete(id).subscribe({
      next: () => {
        this.showSuccessMessage('Promotion supprimée avec succès');
        this.loadPromotions();
      },
      error: (err) => {
        console.error('Erreur lors de la suppression:', err);
        this.error = err.error?.message || 'Erreur lors de la suppression';
      }
    });
  }

  togglePromotion(promotion: Promotion) {
    this.promotionService.toggle(promotion.id, !promotion.actif).subscribe({
      next: (response) => {
        promotion.actif = !promotion.actif;
        this.showSuccessMessage(
          promotion.actif ? 'Promotion activée' : 'Promotion désactivée'
        );
      },
      error: (err) => {
        console.error('Erreur lors du changement de statut:', err);
        this.error = err.error?.message || 'Erreur lors du changement de statut';
      }
    });
  }
  onProduitChange(event: Event, produitId: number) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      if (!this.selectedProduits.includes(produitId)) {
        this.selectedProduits.push(produitId);
      }
    } else {
      this.selectedProduits = this.selectedProduits.filter(id => id !== produitId);
    }
  }

  dupliquerPromotion(promotion: Promotion) {
    const data = {
      nom: `${promotion.nom} (Copie)`,
      description: promotion.description,
      reduction: promotion.reduction,
      dateDebut: new Date().toISOString(),
      dateFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 jours
      actif: false
    };

    this.promotionService.dupliquer(promotion.id, data).subscribe({
      next: () => {
        this.showSuccessMessage('Promotion dupliquée avec succès');
        this.loadPromotions();
      },
      error: (err) => {
        console.error('Erreur lors de la duplication:', err);
        this.error = err.error?.message || 'Erreur lors de la duplication';
      }
    });
  }

  // Gestion des produits
  openProduitModal(promotionId: number) {
    this.currentPromotionId = promotionId;
    this.showProduitModal = true;
    this.selectedProduits = [];
    
    // Pré-sélectionner les produits déjà associés
    const promotion = this.promotions.find(p => p.id === promotionId);
    if (promotion?.produits) {
      this.selectedProduits = promotion.produits.map(p => p.id);
    }
  }

  closeProduitModal() {
    this.showProduitModal = false;
    this.currentPromotionId = null;
    this.selectedProduits = [];
  }

  // Dans votre composant Angular

associerProduits() {
  if (!this.currentPromotionId || this.selectedProduits.length === 0) {
    console.error('Données manquantes:', {
      promotionId: this.currentPromotionId,
      selectedProduits: this.selectedProduits
    });
    return;
  }

  console.log('Début association:', {
    promotionId: this.currentPromotionId,
    produits: this.selectedProduits
  });

  // Associer chaque produit sélectionné
  const promises = this.selectedProduits.map(produitId => {
    console.log(`Association produit ${produitId} à la promotion ${this.currentPromotionId}`);
    
    return this.promotionService.associerProduit(this.currentPromotionId!, produitId)
      .toPromise()
      .then(result => {
        console.log(`Succès association produit ${produitId}:`, result);
        return result;
      })
      .catch(error => {
        console.error(`Erreur association produit ${produitId}:`, error);
        throw error;
      });
  });

  Promise.all(promises).then((results) => {
    console.log('Toutes les associations terminées:', results);
    this.showSuccessMessage('Produits associés avec succès');
    this.closeProduitModal();
    this.loadPromotions();
  }).catch(err => {
    console.error('Erreur lors de l\'association:', err);
    this.error = err.error?.message || 'Erreur lors de l\'association des produits';
  });
}

  dissocierProduit(promotionId: number, produitId: number) {
    if (!confirm('Êtes-vous sûr de vouloir dissocier ce produit ?')) {
      return;
    }

    this.promotionService.dissocierProduit(promotionId, produitId).subscribe({
      next: () => {
        this.showSuccessMessage('Produit dissocié avec succès');
        this.loadPromotions();
      },
      error: (err) => {
        console.error('Erreur lors de la dissociation:', err);
        this.error = err.error?.message || 'Erreur lors de la dissociation';
      }
    });
  }

  // Utilitaires
  isFormValid(): boolean {
    return !!(
      this.promotionForm.nom &&
      this.promotionForm.reduction &&
      this.promotionForm.reduction > 0 &&
      this.promotionForm.reduction <= 100 &&
      this.promotionForm.dateDebut &&
      this.promotionForm.dateFin &&
      new Date(this.promotionForm.dateFin) > new Date(this.promotionForm.dateDebut)
    );
  }

  isActive(promotion: Promotion): boolean {
    if (!promotion.actif) return false;
    
    const now = new Date();
    const debut = new Date(promotion.dateDebut);
    const fin = new Date(promotion.dateFin);
    
    return now >= debut && now <= fin;
  }

  isExpired(promotion: Promotion): boolean {
    return new Date(promotion.dateFin) < new Date();
  }

  isFuture(promotion: Promotion): boolean {
    return new Date(promotion.dateDebut) > new Date();
  }

  getStatutClass(promotion: Promotion): string {
    if (!promotion.actif) return 'statut-inactive';
    if (this.isActive(promotion)) return 'statut-active';
    if (this.isExpired(promotion)) return 'statut-expired';
    if (this.isFuture(promotion)) return 'statut-future';
    return '';
  }

  getStatutText(promotion: Promotion): string {
    if (!promotion.actif) return 'Inactive';
    if (this.isActive(promotion)) return 'Active';
    if (this.isExpired(promotion)) return 'Expirée';
    if (this.isFuture(promotion)) return 'Future';
    return 'Inconnue';
  }

  // Filtrage et pagination
  get promotionsFiltrees() {
    let filtered = [...this.promotions];
    
    if (this.searchTerm) {
      filtered = filtered.filter(p => 
        p.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }
    
    if (this.filterActif) {
      switch (this.filterActif) {
        case 'active':
          filtered = filtered.filter(p => this.isActive(p));
          break;
        case 'inactive':
          filtered = filtered.filter(p => !p.actif);
          break;
        case 'expired':
          filtered = filtered.filter(p => this.isExpired(p));
          break;
        case 'future':
          filtered = filtered.filter(p => this.isFuture(p));
          break;
      }
    }
    
    return filtered;
  }

  get promotionsPaginees() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.promotionsFiltrees.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.promotionsFiltrees.length / this.itemsPerPage);
  }

  changerPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  refresh() {
    this.currentPage = 1;
    this.loadPromotions();
  }

  private showSuccessMessage(message: string) {
    console.log('Succès:', message);
    this.error = '';
    // Ici vous pourriez utiliser un service de toast/notification
  }

  // Permissions
  canEdit(): boolean {
    return this.userRole === 'ADMIN' || this.userRole === 'EMPLOYE';
  }

  canDelete(): boolean {
    return this.userRole === 'ADMIN';
  }
}