export class Paiement {
   id!: number;
  commande_id!: number;
  statut!: 'payée' | 'non_payée';
  mode_paiement!: 'en_ligne' | 'à_la_livraison';
  montant_paye!: number;
  date_paiement!: string;
  reference_transaction?: string;
  created_at!: string;
  updated_at!: string;
}
