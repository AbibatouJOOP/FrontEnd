import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Livraison } from '../models/livraison';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LivraisonService {

  private readonly URL = "http://127.0.0.1:8000/api/livraisons";
  
    constructor(
      private httpClient: HttpClient,
      private authService: AuthService
    ) { }
  
    // CORRECTION: L'interceptor gère automatiquement les headers
    getAll(): Observable<Livraison[]> {
      return this.httpClient.get<Livraison[]>(this.URL);
    }
  
    
  
    updateLivraison(livraison: Livraison, id: number): Observable<Livraison> {
      return this.httpClient.put<Livraison>(`${this.URL}/${id}`, livraison);
    }
  
    
}
