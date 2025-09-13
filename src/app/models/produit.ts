import { Categorie } from "./categorie";
import { Promotion } from "./promotion";

export class Produit {
    id! :number ;
    nom!:string;
    description!:string;
    stock!: number;
    prix!: number;
    image!: string;
    categorie_id!: number;
    categorie?: Categorie;
    
    promotions?: Promotion[];

    // Nouvelles propriétés pour la gestion des stocks
  stock_status?: 'critique' | 'faible' | 'moyen' | 'bon';
  stock_alert_message?: string;
  need_restocking?: boolean;
}

  
  