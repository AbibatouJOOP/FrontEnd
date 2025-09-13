import { Component, OnInit } from '@angular/core';
import { Commande } from '../../models/commande';
import { CommandesService } from '../../services/commandes.service';
import { AuthService } from '../../services/auth.service';
import { ProduitService } from '../../services/produit.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Promotion } from '../../models/promotion';
import { PromotionService } from '../../services/promotion.service';
import jsPDF from 'jspdf';
declare var bootstrap: any;
import autoTable from 'jspdf-autotable';


@Component({
  selector: 'app-commandeclient',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule, 
  ],
  templateUrl: './commandeclient.component.html',
  styleUrl: './commande.component.css'
})
export class CommandeClientComponent implements OnInit{
  currentUser: any;
  commandes : Commande[] =[];
  searchTerm: string = '';
filterStatut: string = '';
commandesFiltrees: Commande[] = [];
showModal = false;
selectedCommande: any = null;
commandeSelectionnee: Commande | null = null;
voirDetails(commande: any) {
  this.selectedCommande = commande;
  console.log(commande.produit_commander);
  this.showModal = true;
}
fermerModal() {
  this.showModal = false;
  this.selectedCommande = null;
}
voirFacture(commande: Commande) {
  this.commandeSelectionnee = commande;
  const modalElement = document.getElementById('modalFacture');
  if (modalElement) {
  const modal = new bootstrap.Modal(modalElement);
  modal.show(); // pour ouvrir le modal
}
}

telechargerFacturePDF(commande: Commande) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('FACTURE', 105, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`Facture N° : ${commande.id}`, 14, 30);
  doc.text(`Date : ${new Date(commande.created_at).toLocaleDateString()}`, 14, 38);

  doc.text('Informations Client :', 14, 50);
  doc.setFontSize(11);
  doc.text(`Nom : ${commande.user?.nomComplet || '---'}`, 14, 58);
  doc.text(`Email : ${commande.user?.email || '---'}`, 14, 64);
  const produits = commande.produit_commander?.map(item => ([
    item.produit?.nom || '---',
    item.quantite,
    `${item.produit?.prix} XOF`,
    `${item.quantite * (item.produit?.prix || 0)} XOF`
  ])) || [];

  autoTable(doc, {
    head: [['Produit', 'Quantité', 'Prix Unitaire', 'Total']],
    body: produits,
    startY: 80,
  });

  const finalY = (doc as any).lastAutoTable.finalY || 80;
  doc.setFontSize(12);
  doc.text(`Montant total : ${commande.montant_total} XOF`, 14, finalY + 10);

  doc.text(`Statut paiement : ${commande.paiement?.statut || 'Non renseigné'}`, 14, finalY + 20);
  doc.text(`Statut livraison : ${commande.livraison?.statut || 'Non renseigné'}`, 14, finalY + 28);
  doc.setFontSize(10);
  doc.text('Merci pour votre confiance !', 105, 290, { align: 'center' });

  doc.save(`facture_${commande.id}.pdf`);
}
  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
   this.getAll();
  }
  constructor(
    private commandeService : CommandesService,
    private authService: AuthService,
  ){}
   getAll(){
      this.commandeService.getByClient().subscribe(
        (data : Commande[])=>{
          this.commandes = data;
          this.commandesFiltrees = [...this.commandes]; 
          console.log(data);
        },
        (error)=>{
          console.log(error);
        }
      )
    }
    changerStatut(commande: Commande, nouveauStatut: Commande['statut']) {
  this.commandeService.updateStatut(commande.id, nouveauStatut).subscribe({
    next: (updated: Commande) => {
      commande.statut = updated.statut;
    },
    error: (err: unknown) => {
      console.error("Erreur lors du changement de statut", err);
    }
  });
}
RechercherCommandes() {
  if (!this.searchTerm || this.searchTerm.trim() === '') {
    // Si la recherche est vide, on affiche toutes les commandes
    this.commandesFiltrees = [...this.commandes];
    return;
  }
  const item = this.searchTerm.toLowerCase();
  this.commandesFiltrees = this.commandes.filter(c =>
    c.id.toString().includes(item) ||
    c.user?.nomComplet?.toLowerCase().includes(item) ||
    c.user?.email?.toLowerCase().includes(item)
  );
}

  Payer(commande: Commande) {
    if (!commande.paiement) {
    console.error("Cette commande n'a pas de paiement associé");
    return;
  }
  const nouveauStatut = 'payée';

    this.commandeService.updatePaiementStatut(commande.id, nouveauStatut).subscribe({
      next: (updated) => {
        if (commande.paiement) commande.paiement.statut = updated.paiement.statut;
      },
      error: (err) => console.error("Erreur paiement", err)
    });
  }
  Filtrer(): void {
    if (this.filterStatut) {
      this.commandesFiltrees = this.commandes.filter(c => c.statut === this.filterStatut);
    } else {
      this.commandesFiltrees = [...this.commandes];
    }
  }
 
}
      