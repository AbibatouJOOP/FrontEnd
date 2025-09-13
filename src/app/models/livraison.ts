import { User } from "./user";

export class Livraison {
  id!: number;
  commande_id!: number;
  employe_id?: number;
  statut!: 'livrée' | 'non_livrée';
  date_livraison!: string;
  adresse_livraison!: string;
  frais_livraison!: number;
  note?: string;
  created_at!: string;
  updated_at!: string;
  
  // Relations
  employe?: User;
}
