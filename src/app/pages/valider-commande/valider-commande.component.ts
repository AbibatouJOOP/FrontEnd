import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommandesService } from '../../services/commandes.service';
import { PanierService } from '../../services/panier.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-valider-commande',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './valider-commande.component.html',
  styleUrl: './valider-commande.component.css'
})
export class ValiderCommandeComponent implements OnInit {
  // Informations de livraison
  infosLivraison = {
    nomComplet: '',
    telephone: '',
    adresse: '',
    ville: '',
    fraisLivraison: 0,
    codePostal: '',
    commentaires: ''
  };

  // Informations de paiement
  infosPaiement = {
    modePaiement: 'livraison', // 'livraison' ou 'enligne'
    numeroTelephone: '', // Pour paiement mobile money
    operateur: 'orange' // 'orange', 'mtn', 'moov'
  };

  zonesLivraison = [
    { nom: 'Dakar', tarif: 2000 },
    { nom: 'Rufisque', tarif: 2500 },
    { nom: 'Pikine', tarif: 1500 },
    { nom: 'Autre', tarif: 0 } // Cas de tarif personnalisé
  ];

  // États du composant
  loading = false;
  error = '';
  etapeActuelle = 1; // 1: Livraison, 2: Paiement, 3: Confirmation

  constructor(
    public panierService: PanierService,
    private commandesService: CommandesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Vérifier si le panier n'est pas vide
    if (this.panierService.getProduits().length === 0) {
      console.log('Panier vide, redirection vers panier');
      this.router.navigate(['/client/panier']);
      return;
    }

    // Pré-remplir avec les infos utilisateur si disponibles
    this.preremplirInfosUtilisateur();
  }

  preremplirInfosUtilisateur() {
  this.authService.waitForUserLoaded().subscribe({
    next: (user) => {
      if (user) {
        // On remplit directement le champ avec le nom complet du client connecté
        this.infosLivraison.nomComplet = user.nomComplet || '';
      }
    },
    error: (err) => {
      console.error('Erreur lors du chargement utilisateur:', err);
    }
  });
}


  passerEtapeSuivante() {
    if (this.etapeActuelle === 1 && this.validerInfosLivraison()) {
      this.etapeActuelle = 2;
      this.error = '';
    } else if (this.etapeActuelle === 2 && this.validerInfosPaiement()) {
      this.etapeActuelle = 3;
      this.error = '';
    }
  }

  passerEtapePrecedente() {
    if (this.etapeActuelle > 1) {
      this.etapeActuelle--;
      this.error = '';
    }
  }

  validerInfosLivraison(): boolean {
    const required = ['nomComplet', 'telephone', 'adresse', 'ville'];
    const manquant = required.find(field => 
      !this.infosLivraison[field as keyof typeof this.infosLivraison]
    );
    
    if (manquant) {
      this.error = `Le champ "${this.getFieldLabel(manquant)}" est obligatoire`;
      return false;
    }

    // Validation du téléphone (format basique)
    const phoneRegex = /^(\+221)?[0-9\s\-\(\)]{8,}$/;
    if (!phoneRegex.test(this.infosLivraison.telephone.trim())) {
      this.error = 'Le numéro de téléphone n\'est pas valide';
      return false;
    }
    
    return true;
  }

  validerInfosPaiement(): boolean {
    if (this.infosPaiement.modePaiement === 'enligne') {
      if (!this.infosPaiement.numeroTelephone?.trim()) {
        this.error = 'Veuillez saisir votre numéro de téléphone pour le paiement mobile money';
        return false;
      }

      // Validation du numéro mobile money
      const phoneRegex = /^(\+221)?[0-9\s\-\(\)]{8,}$/;
      if (!phoneRegex.test(this.infosPaiement.numeroTelephone.trim())) {
        this.error = 'Le numéro de téléphone pour le paiement n\'est pas valide';
        return false;
      }

      if (!this.infosPaiement.operateur) {
        this.error = 'Veuillez sélectionner un opérateur mobile money';
        return false;
      }
    }
    
    return true;
  }

  

  finaliserCommande() {
    if (this.loading) return;

    // Validation finale
    if (!this.validerInfosLivraison() || !this.validerInfosPaiement()) {
      return;
    }

    this.loading = true;
    this.error = '';

    // Préparer les données de la commande
    const produitsPanier = this.panierService.getProduits();
    
    if (produitsPanier.length === 0) {
      this.error = 'Votre panier est vide';
      this.loading = false;
      return;
    }

    const commandeData = {
      produits: produitsPanier.map(item => ({
        produit_id: item.produit.id,
        quantite: item.quantite,
        prixU: item.produit.prix,
        promo_id: null // À implémenter si vous avez des promos
      })),
      montant_total: this.panierService.getTotal(),
      infos_livraison: {
        ...this.infosLivraison,
        nomComplet: this.infosLivraison.nomComplet.trim(),
        telephone: this.infosLivraison.telephone.trim(),
        adresse: this.infosLivraison.adresse.trim(),
        ville: this.infosLivraison.ville.trim(),
        codePostal: this.infosLivraison.codePostal.trim(),
        commentaires: this.infosLivraison.commentaires.trim()
      },
      infos_paiement: {
        ...this.infosPaiement,
        numeroTelephone: this.infosPaiement.numeroTelephone.trim()
      },
      statut: 'en_préparation'
    };

    console.log('Données commande à envoyer:', commandeData);

    this.commandesService.createCommande(commandeData).subscribe({
      next: (response) => {
        console.log('Commande créée avec succès:', response);
        
        // Vider le panier après commande réussie
        this.panierService.viderPanier();
        
        // Rediriger vers la liste des commandes du client avec message de succès
        this.router.navigate(['/client/commandes'], {
          queryParams: { 
            success: 'Votre commande a été passée avec succès! Vous recevrez une confirmation par téléphone.',
            commandeId: response.commande?.id || response.id
          }
        });
      },
      error: (err) => {
        console.error('Erreur lors de la finalisation de la commande:', err);
        
        let errorMessage = 'Erreur lors de la finalisation de la commande. Veuillez réessayer.';
        
        if (err.error) {
          if (err.error.errors) {
            // Erreurs de validation Laravel
            const errors = Object.values(err.error.errors).flat();
            errorMessage = errors[0] as string;
          } else if (err.error.message) {
            errorMessage = err.error.message;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.error = errorMessage;
        this.loading = false;
      }
    });
  }

  retournerPanier() {
    this.router.navigate(['/client/panier']);
  }

  getTotalArticles(): number {
    return this.panierService.getProduits().reduce((total, item) => total + item.quantite, 0);
  }

  // Utilitaires
  private getFieldLabel(field: string): string {
    const labels: {[key: string]: string} = {
      'nom': 'Nom',
      'prenom': 'Prénom', 
      'telephone': 'Téléphone',
      'adresse': 'Adresse',
      'ville': 'Ville'
    };
    return labels[field] || field;
  }

  // Méthodes pour la gestion des étapes
  allerEtape(etape: number) {
    if (etape <= this.etapeActuelle) {
      this.etapeActuelle = etape;
      this.error = '';
    }
  }

  etapeEstActive(etape: number): boolean {
    return this.etapeActuelle === etape;
  }

  etapeEstComplete(etape: number): boolean {
    return this.etapeActuelle > etape;
  }

  // Debug
  debugPanier() {
    console.log('Contenu du panier:', {
      produits: this.panierService.getProduits(),
      total: this.panierService.getTotal(),
      nbArticles: this.getTotalArticles()
    });
  }

  // Quand l’utilisateur sélectionne une zone
onZoneChange(event: Event) {
  const select = event.target as HTMLSelectElement;
  const zone = this.zonesLivraison.find(z => z.nom === select.value);

  if (zone) {
    if (zone.tarif > 0) {
      this.infosLivraison.fraisLivraison = zone.tarif;
    } else {
      // Tarif personnalisé → on laisse l’utilisateur saisir
      this.infosLivraison.fraisLivraison = 0;
    }
  }
}

// Quand l’utilisateur saisit un frais personnalisé
onFraisLivraisonChange(frais: number) {
  this.infosLivraison.fraisLivraison = frais > 0 ? frais : 0;
}

// --- PROMOTIONS / CALCULS ---
aPromotion(item: any): boolean {
  return !!(item.produit.promotion && item.produit.promotion.reduction);
}

getPourcentageReduction(item: any): number {
  return item.produit.promotion ? item.produit.promotion.reduction : 0;
}

calculerPrixAvecPromo(item: any): number {
  const prix = item.produit.prix;
  if (this.aPromotion(item)) {
    return prix * (1 - (item.produit.promotion.reduction / 100));
  }
  return prix;
}

// --- TOTALS ---
getTotalGeneral(): number {
  const produits = this.panierService.getProduits();
  const totalProduits = produits.reduce((total, item) => {
    return total + (this.calculerPrixAvecPromo(item) * item.quantite);
  }, 0);

  return totalProduits + (this.infosLivraison.fraisLivraison || 0);
}

getEconomiesTotal(): number {
  const produits = this.panierService.getProduits();
  return produits.reduce((economies, item) => {
    if (this.aPromotion(item)) {
      const reductionParUnite = item.produit.prix - this.calculerPrixAvecPromo(item);
      return economies + (reductionParUnite * item.quantite);
    }
    return economies;
  }, 0);
}

}