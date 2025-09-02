import { Component, OnInit } from '@angular/core';
import { PanierService } from '../../services/panier.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './panier.component.html',
  styleUrls: ['./panier.component.css']
})
export class PanierComponent implements OnInit{
  constructor(
    public panierService: PanierService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('PanierComponent chargé');
  }

  allerAuCatalogue() {
    this.router.navigate(['/client/catalogue']);
  }

  augmenterQuantite(produitId: number) {
    const quantiteActuelle = this.panierService.getQuantiteProduit(produitId);
    this.panierService.modifierQuantite(produitId, quantiteActuelle + 1);
  }

  diminuerQuantite(produitId: number) {
    const quantiteActuelle = this.panierService.getQuantiteProduit(produitId);
    if (quantiteActuelle > 1) {
      this.panierService.modifierQuantite(produitId, quantiteActuelle - 1);
    }
  }

  retirerProduit(produitId: number) {
    if (confirm('Êtes-vous sûr de vouloir retirer ce produit du panier ?')) {
      this.panierService.retirerProduit(produitId);
    }
  }

  viderPanier() {
    if (confirm('Êtes-vous sûr de vouloir vider complètement votre panier ?')) {
      this.panierService.viderPanier();
    }
  }

  passerCommande() {
    if (this.panierService.getProduits().length === 0) {
      alert('Votre panier est vide !');
      return;
    }
    
    this.router.navigate(['/client/validerCommande']);
  }

  getTotalArticles(): number {
    return this.panierService.getProduits().reduce((total, item) => total + item.quantite, 0);
  }
}
