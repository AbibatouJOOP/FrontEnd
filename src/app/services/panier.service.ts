import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Produit } from '../models/produit';
import { ProduitPanier } from '../models/produit-panier';

@Injectable({
  providedIn: 'root'
})
export class PanierService {
private produits: ProduitPanier[] = [];
  private nombreProduitsSubject = new BehaviorSubject<number>(0);

  constructor() {
    // Charger le panier depuis le localStorage au démarrage
    this.chargerPanier();
  }

  // Ajouter un produit au panier
  ajouterProduit(produit: Produit, quantite: number = 1) {
    const index = this.produits.findIndex(item => item.produit.id === produit.id);
    
    if (index !== -1) {
      // Le produit existe déjà, augmenter la quantité
      this.produits[index].quantite += quantite;
    } else {
      // Nouveau produit
      this.produits.push({ produit, quantite });
    }
    
    this.mettreAJour();
  }

  // Retirer un produit du panier
  retirerProduit(produitId: number) {
    this.produits = this.produits.filter(item => item.produit.id !== produitId);
    this.mettreAJour();
  }

  // Modifier la quantité d'un produit
  modifierQuantite(produitId: number, quantite: number) {
    const index = this.produits.findIndex(item => item.produit.id === produitId);
    
    if (index !== -1) {
      if (quantite <= 0) {
        this.retirerProduit(produitId);
      } else {
        this.produits[index].quantite = quantite;
        this.mettreAJour();
      }
    }
  }

  // Vider le panier
  viderPanier() {
    this.produits = [];
    this.mettreAJour();
  }

  // Obtenir tous les produits du panier
  getProduits(): ProduitPanier[] {
    return [...this.produits];
  }

  // Obtenir le nombre total de produits
  getNombreProduits() {
    return this.nombreProduitsSubject.asObservable();
  }

  // Calculer le total du panier
  getTotal(): number {
    return this.produits.reduce((total, item) => {
      return total + (item.produit.prix * item.quantite);
    }, 0);
  }

  // Vérifier si un produit est dans le panier
  estDansPanier(produitId: number): boolean {
    return this.produits.some(item => item.produit.id === produitId);
  }

  // Obtenir la quantité d'un produit spécifique
  getQuantiteProduit(produitId: number): number {
    const item = this.produits.find(item => item.produit.id === produitId);
    return item ? item.quantite : 0;
  }

  // Méthodes privées
  private mettreAJour() {
    this.sauvegarderPanier();
    const nombreTotal = this.produits.reduce((total, item) => total + item.quantite, 0);
    this.nombreProduitsSubject.next(nombreTotal);
  }

  private sauvegarderPanier() {
    // Note: Dans un environnement réel, vous pourriez vouloir sauvegarder sur un serveur
    // Ici nous utilisons sessionStorage comme alternative à localStorage
    if (typeof Storage !== 'undefined') {
      sessionStorage.setItem('panier', JSON.stringify(this.produits));
    }
  }

  private chargerPanier() {
    if (typeof Storage !== 'undefined') {
      const panierSauvegarde = sessionStorage.getItem('panier');
      if (panierSauvegarde) {
        try {
          this.produits = JSON.parse(panierSauvegarde);
          const nombreTotal = this.produits.reduce((total, item) => total + item.quantite, 0);
          this.nombreProduitsSubject.next(nombreTotal);
        } catch (error) {
          console.error('Erreur lors du chargement du panier:', error);
          this.produits = [];
        }
      }
    }
  }
}
