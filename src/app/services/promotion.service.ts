import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Promotion } from '../models/promotion';

@Injectable({
  providedIn: 'root'
})
export class PromotionService {
private apiUrl = 'http://localhost:8000/api/promotions';

  constructor(private http: HttpClient) {}

  // Récupérer toutes les promotions
  getAll(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(this.apiUrl);
  }

  // Récupérer une promotion par ID
  getById(id: number): Observable<Promotion> {
    return this.http.get<Promotion>(`${this.apiUrl}/${id}`);
  }

  // Créer une nouvelle promotion
  create(promotion: Partial<Promotion>): Observable<any> {
    return this.http.post(this.apiUrl, promotion);
  }

  // Mettre à jour une promotion
  update(id: number, promotion: Partial<Promotion>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, promotion);
  }

  // Supprimer une promotion
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Récupérer les promotions actives
  getActive(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.apiUrl}/actives`);
  }

  // Récupérer les produits en promotion
  getProduitsEnPromotion(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/produits-en-promotion`);
  }

  // Calculer le prix avec promotion
  calculerPrix(produitId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/calculer-prix/${produitId}`);
  }

  // Activer/Désactiver une promotion
  toggle(id: number, actif: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle`, { actif });
  }

  // Dupliquer une promotion
  dupliquer(id: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/dupliquer`, data);
  }

  // Associer un produit à une promotion
  associerProduit(promotionId: number, produitId: number, montantReduction?: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${promotionId}/associer-produit`, {
      produit_id: produitId,
      montant_reduction: montantReduction
    });
  }

  // Dissocier un produit d'une promotion
  dissocierProduit(promotionId: number, produitId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${promotionId}/dissocier-produit/${produitId}`);
  }
}