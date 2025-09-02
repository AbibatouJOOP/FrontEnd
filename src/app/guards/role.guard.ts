import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of, map, catchError, switchMap } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier d'abord si l'utilisateur est authentifié
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return of(false);
  }

  // Récupérer les rôles requis depuis les données de la route
  const requiredRoles = route.data?.['roles'] as Array<string>;

  if (!requiredRoles || requiredRoles.length === 0) {
    return of(true);
  }

  // CORRECTION: Utiliser waitForUserLoaded pour s'assurer que l'utilisateur est chargé
  return authService.waitForUserLoaded().pipe(
    map(user => {
      console.log('RoleGuard - Utilisateur:', user);
      console.log('RoleGuard - Rôles requis:', requiredRoles);
      
      if (user && requiredRoles.includes(user.role)) {
        return true;
      } else {
        console.log('Accès refusé - rôle insuffisant');
        router.navigate(['/unauthorized']);
        return false;
      }
    }),
    catchError((error) => {
      console.error('Erreur dans roleGuard:', error);
      router.navigate(['/login']);
      return of(false);
    })
  );
};