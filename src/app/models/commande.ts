import { CommandeProduit } from "./commande-produit";
import { Livraison } from "./livraison";
import { Paiement } from "./paiement";
import { Produit } from "./produit";
import { User } from "./user";

export type StatutCommande = "en_préparation" | "prete" | "en_livraison" | "livrée" | "annulée";

export class Commande {
   id!: number;
  client_id!: number;
  montant_total!: number;
  statut!: StatutCommande;
  created_at!: string;
  updated_at!: string;

  // Relations
  user?: User;                    // client associé
  client?: User;                  // alias pour user
  produit_commander?: CommandeProduit[]; // produits commandés avec quantités
  produits?: Produit[];           // produits de la commande
  paiement?: Paiement;            // paiement lié
  livraison?: Livraison;
}
