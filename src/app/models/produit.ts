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
    
}
