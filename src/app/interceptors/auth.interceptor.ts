import { HttpErrorResponse, HttpHeaders, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router'; 
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Récupérer le token
  const token = localStorage.getItem('token');

  // Si pas de token, passer la requête sans modification
  if (!token) {
    console.log('Aucun token trouvé');
    return next(req);
  }

  console.log('Token utilisé:', token); // Déplacé ici

  // Cloner la requête et ajouter les headers
  const authReq = req.clone({
    setHeaders: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  console.log('Requête avec headers:', authReq.headers.keys());

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Erreur HTTP:', error);
      
      // Si erreur 401 (Unauthorized), déconnecter et rediriger
      if (error.status === 401) {
        console.log('Token expiré ou invalide, déconnexion...');
        localStorage.removeItem('token');
        router.navigate(['/login']);
      }
      
      return throwError(() => error);
    })
  );
};