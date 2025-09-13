import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommandesService } from '../../services/commandes.service';
import { PaiementService } from '../../services/paiement.service';
import { LivraisonService } from '../../services/livraison.service';
import { ProduitService } from '../../services/produit.service';
import { UserService } from '../../services/user.service';
import { Observable, of, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
})
export class AccueilComponent implements OnInit {
  currentUser: any;
  isLoading = true;

  //propriétés pour la gestion des stocks
  produitsStockFaible: any[] = [];
  produitSelectionne: any = null;
  quantiteAjout: number = 1;

  // Statistiques générales
  totalCommandes = 0;
  totalPaiements = 0;
  totalLivraisons = 0;
  totalProduits = 0;
  totalUtilisateurs = 0;
  chiffreAffaires = 0;
  commandesDuJour = 0;

  // Statuts détaillés
  commandesStatut: any = {
    en_preparation: 0,
    prete: 0,
    en_livraison: 0,
    livree: 0,
    annulee: 0
  };

  paiementsStatut: any = {
    payee: 0,
    en_attente: 0,
    echoue: 0
  };

  livraisonsStatut: any = {
    livree: 0,
    en_cours: 0,
    en_attente: 0,
    echouee: 0
  };

  // Données pour Client
  mesCommandes: any[] = [];
  commandesRecentes: any[] = [];
  montantTotalCommandes = 0;

  // Données pour graphiques
  commandesParMois: any[] = [];
  produitsPopulaires: any[] = [];

  constructor(
    private authService: AuthService,
    private commandeService: CommandesService,
    private paiementService: PaiementService,
    private livraisonService: LivraisonService,
    private produitService: ProduitService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.authService.waitForUserLoaded().subscribe(user => {
      this.currentUser = user;
      this.loadDashboard();
    });
  }

  loadDashboard() {
    if (!this.currentUser) return;

    this.isLoading = true;

    if (this.currentUser.role === 'ADMIN') {
      this.loadAdminStats();
    } else if (this.currentUser.role === 'EMPLOYE') {
      this.loadEmployeStats();
    } else if (this.currentUser.role === 'CLIENT') {
      this.loadClientDashboard();
    }
  }

  // -------------------- Admin Dashboard --------------------
  loadAdminStats() {
    const requests = [
      this.commandeService.getAll(),
      this.paiementService.getAll(),
      this.livraisonService.getAll(),
      this.produitService.getAll(),
      this.userService.getAll()
    ];

    forkJoin(requests).subscribe({
      next: ([commandes, paiements, livraisons, produits, users]) => {
        this.processAdminData(commandes, paiements, livraisons, produits, users);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.isLoading = false;
      }
    });
  }

  processAdminData(commandes: any[], paiements: any[], livraisons: any[], produits: any[], users: any[]) {
    // Statistiques générales
    this.totalCommandes = commandes.length;
    this.totalPaiements = paiements.length;
    this.totalLivraisons = livraisons.length;
    this.totalProduits = produits.length;
    this.totalUtilisateurs = users.length;

    // Chiffre d'affaires
    this.chiffreAffaires = paiements
      .filter(p => p.statut === 'payée')
      .reduce((total, p) => total + parseFloat(p.montant_paye || p.montant || 0), 0);

    // Commandes du jour
    const today = new Date().toISOString().split('T')[0];
    this.commandesDuJour = commandes.filter(c => 
      c.created_at && c.created_at.startsWith(today)
    ).length;

    // Statuts des commandes
    this.commandesStatut = {
      en_preparation: commandes.filter(c => c.statut === 'en_préparation').length,
      prete: commandes.filter(c => c.statut === 'prete').length,
      en_livraison: commandes.filter(c => c.statut === 'en_livraison').length,
      livree: commandes.filter(c => c.statut === 'livrée').length,
      annulee: commandes.filter(c => c.statut === 'annulée').length,
    };

    // Statuts des paiements
    this.paiementsStatut = {
      payee: paiements.filter(p => p.statut === 'payée').length,
      en_attente: paiements.filter(p => p.statut === 'en_attente').length,
      echoue: paiements.filter(p => p.statut === 'échoué').length
    };

    // Statuts des livraisons
    this.livraisonsStatut = {
      livree: livraisons.filter(l => l.statut === 'livrée').length,
      en_cours: livraisons.filter(l => l.statut === 'en_cours').length,
      en_attente: livraisons.filter(l => l.statut === 'en_attente').length,
      echouee: livraisons.filter(l => l.statut === 'échouée').length
    };

    // Commandes récentes (5 dernières)
    this.commandesRecentes = commandes
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }

  // -------------------- Employé Dashboard --------------------
  loadEmployeStats() {
    const requests = [
      this.commandeService.getAll(),
      this.paiementService.getAll(),
      this.livraisonService.getAll()
    ];

    forkJoin(requests).subscribe({
      next: ([commandes, paiements, livraisons]) => {
        this.processEmployeData(commandes, paiements, livraisons);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.isLoading = false;
      }
    });
  }

  processEmployeData(commandes: any[], paiements: any[], livraisons: any[]) {
    // Focus sur les tâches opérationnelles
    this.totalCommandes = commandes.length;
    this.totalPaiements = paiements.length;
    this.totalLivraisons = livraisons.length;

    // Commandes du jour
    const today = new Date().toISOString().split('T')[0];
    this.commandesDuJour = commandes.filter(c => 
      c.created_at && c.created_at.startsWith(today)
    ).length;

    // Statuts pertinents pour l'employé
    this.commandesStatut = {
      en_preparation: commandes.filter(c => c.statut === 'en_préparation').length,
      prete: commandes.filter(c => c.statut === 'prete').length,
      en_livraison: commandes.filter(c => c.statut === 'en_livraison').length,
      livree: commandes.filter(c => c.statut === 'livrée').length,
      annulee: commandes.filter(c => c.statut === 'annulée').length,
    };

    this.paiementsStatut = {
      payee: paiements.filter(p => p.statut === 'payée').length,
      en_attente: paiements.filter(p => p.statut === 'en_attente').length,
      echoue: paiements.filter(p => p.statut === 'échoué').length
    };

    this.livraisonsStatut = {
      livree: livraisons.filter(l => l.statut === 'livrée').length,
      en_cours: livraisons.filter(l => l.statut === 'en_cours').length,
      en_attente: livraisons.filter(l => l.statut === 'en_attente').length,
      echouee: livraisons.filter(l => l.statut === 'échouée').length
    };

    // Commandes récentes à traiter
    this.commandesRecentes = commandes
      .filter(c => ['en_préparation', 'prete'].includes(c.statut))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  }

  // -------------------- Client Dashboard --------------------
  loadClientDashboard() {
    this.commandeService.getByClient().subscribe({
      next: (data) => {
        this.mesCommandes = data;
        this.processClientData(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes:', error);
        this.isLoading = false;
      }
    });
  }

  processClientData(commandes: any[]) {
    this.totalCommandes = commandes.length;
    
    // Montant total de toutes les commandes
    this.montantTotalCommandes = commandes.reduce((total, c) => 
      total + parseFloat(c.montant_total || 0), 0);

    // Statuts des commandes du client
    this.commandesStatut = {
      en_preparation: commandes.filter(c => c.statut === 'en_préparation').length,
      prete: commandes.filter(c => c.statut === 'prete').length,
      en_livraison: commandes.filter(c => c.statut === 'en_livraison').length,
      livree: commandes.filter(c => c.statut === 'livrée').length,
      annulee: commandes.filter(c => c.statut === 'annulée').length,
    };

    // Commandes récentes (5 dernières)
    this.commandesRecentes = commandes
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }

  // -------------------- Utilitaires --------------------
  getCurrentDate(): Date {
    return new Date();
  }

  getProgressPercentage(current: number, total: number): number {
    return total > 0 ? Math.round((current / total) * 100) : 0;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses = {
      'en_préparation': 'badge-warning',
      'prete': 'badge-info',
      'en_livraison': 'badge-primary',
      'livrée': 'badge-success',
      'annulée': 'badge-danger',
      'payée': 'badge-success',
      'en_attente': 'badge-warning',
      'échoué': 'badge-danger'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'badge-secondary';
  }

  getStatusLabel(status: string): string {
    const statusLabels = {
      'en_préparation': 'En préparation',
      'prete': 'Prête',
      'en_livraison': 'En livraison',
      'livrée': 'Livrée',
      'annulée': 'Annulée',
      'payée': 'Payée',
      'en_attente': 'En attente',
      'échoué': 'Échoué'
    };
    return statusLabels[status as keyof typeof statusLabels] || status;
  }


  

}