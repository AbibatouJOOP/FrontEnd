import { Injectable } from '@angular/core';
import { Categorie } from '../models/categorie';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategorieService {

  private readonly URL = "http://127.0.0.1:8000/api/categories";

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) { }

  // CORRECTION: L'interceptor gère automatiquement les headers
  getAll(): Observable<Categorie[]> {
    return this.httpClient.get<Categorie[]>(this.URL);
  }

  addCategorie(categorie: Categorie): Observable<Categorie> {
    return this.httpClient.post<Categorie>(this.URL, categorie);
  }

  updateCategorie(categorie: Categorie, id: number): Observable<Categorie> {
    return this.httpClient.put<Categorie>(`${this.URL}/${id}`, categorie);
  }

  deleteCategorie(id: number): Observable<any> {
    return this.httpClient.delete(`${this.URL}/${id}`);
  }

  getById(id: number): Observable<Categorie> {
    return this.httpClient.get<Categorie>(`${this.URL}/${id}`);
  }

  // Méthodes utilitaires pour vérifier les permissions
  canManageCategories(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  canViewCategories(): boolean {
    return this.authService.isAuthenticated();
  }
}