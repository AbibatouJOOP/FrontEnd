import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Produit } from '../models/produit';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {
private readonly URL = "http://127.0.0.1:8000/api";
  private readonly ADMIN_URL = `${this.URL}/produits`;
  private readonly CLIENT_URL = `${this.URL}/produitsClient`;

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) { }

  // Méthode pour ADMIN - accès complet aux produits
  getAll(): Observable<Produit[]> {
    return this.httpClient.get<Produit[]>(this.ADMIN_URL);
  }

  // Méthode pour CLIENT - catalogue public
  getAllForClient(): Observable<Produit[]> {
    return this.httpClient.get<Produit[]>(this.CLIENT_URL);
  }

  // Méthode intelligente qui choisit selon le rôle
  getProduits(): Observable<Produit[]> {
    const user = this.authService.getCurrentUser();
    
    if (user && user.role === 'ADMIN') {
      return this.getAll();
    } else {
      return this.getAllForClient();
    }
  }

  addProduit(produit: FormData): Observable<any> {
    return this.httpClient.post(`${this.ADMIN_URL}`, produit);
  }

  updateProduit(produit: FormData, id: number): Observable<any> {
    return this.httpClient.post(`${this.ADMIN_URL}/${id}?_method=PUT`, produit);
  }

  deleteProduit(id: number): Observable<any> {
    return this.httpClient.delete(`${this.ADMIN_URL}/${id}`);
  }

  getById(id: number): Observable<Produit> {
    return this.httpClient.get<Produit>(`${this.ADMIN_URL}/${id}`);
  }

  // Méthode pour obtenir les détails d'un produit (accessible à tous les rôles authentifiés)
  getByIdForClient(id: number): Observable<Produit> {
    return this.httpClient.get<Produit>(`${this.URL}/produits/${id}`);
  }

  // NOUVELLES MÉTHODES POUR LA GESTION DES STOCKS

  /**
   * Réapprovisionner un produit
   */
  restockProduit(id: number, quantite: number): Observable<any> {
    return this.httpClient.post(`${this.ADMIN_URL}/${id}/restock`, { quantite });
  }

  /**
   * Obtenir les produits avec stock faible
   */
  getLowStockProducts(): Observable<Produit[]> {
    return this.httpClient.get<Produit[]>(`${this.ADMIN_URL}/low-stock`);
  }

  /**
   * Obtenir les statistiques de stock
   */
  getStockStatistics(): Observable<any> {
    return this.httpClient.get(`${this.ADMIN_URL}/stock-statistics`);
  }

  /**
   * Déterminer la classe CSS pour le statut du stock
   */
  getStockStatusClass(stockStatus: string): string {
    switch (stockStatus) {
      case 'critique':
        return 'stock-critique';
      case 'faible':
        return 'stock-faible';
      case 'moyen':
        return 'stock-moyen';
      case 'bon':
        return 'stock-bon';
      default:
        return '';
    }
  }

  /**
   * Obtenir l'icône appropriée pour le statut du stock
   */
  getStockIcon(stockStatus: string): string {
    switch (stockStatus) {
      case 'critique':
        return 'fas fa-exclamation-triangle';
      case 'faible':
        return 'fas fa-exclamation-circle';
      case 'moyen':
        return 'fas fa-info-circle';
      case 'bon':
        return 'fas fa-check-circle';
      default:
        return 'fas fa-question-circle';
    }
  }
}