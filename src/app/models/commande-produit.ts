import { Produit } from "./produit";
import { Promotion } from "./promotion";

export class CommandeProduit {
    id!: number;
  commande_id!: number;
  produit_id!: number;
  quantite!: number;
  prixU!: number; // Prix unitaire au moment de la commande
  montant_total!: number;
  promo_id?: number | null;
  created_at!: string;
  updated_at!: string;

  // Relations
  produit?: Produit;
  promotion?: Promotion;
}
