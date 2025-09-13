import { Produit } from "./produit";

export interface Promotion {
  id: number;
  nom: string;
  description?: string;
  reduction: number;
  dateDebut: string;
  dateFin: string;
  actif: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Relations
  produits?: any[];
}

export interface PromotionProduit {
  id: number;
  promo_id: number;
  produit_id: number;
  montant_reduction?: number;
  created_at?: string;
  updated_at?: string;
  
  // Relations
  promotion?: Promotion;
  produit?: Produit;
}