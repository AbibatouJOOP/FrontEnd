import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Paiement } from '../models/paiement';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaiementService {

  private readonly URL = "http://127.0.0.1:8000/api/paiements";
    
      constructor(
        private httpClient: HttpClient,
        private authService: AuthService
      ) { }

      getAll(): Observable<Paiement[]> {
  return this.httpClient.get<any[]>(this.URL).pipe(
    map(data => {
      console.log("Réponse Laravel :", data); 
      return data.map(p => ({
        ...p,
        montant_paye: p['montant_payé']  
      }));
    })
  );
}
}
