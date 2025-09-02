import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Login } from '../models/login';
import { Register } from '../models/register';
import { TokenResponse } from '../models/token-response';
import { BehaviorSubject, Observable, tap , catchError, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly URL = "http://127.0.0.1:8000/api";
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Charger l'utilisateur au démarrage si token existe
    if (this.isAuthenticated()) {
      this.loadUser().subscribe();
    }
  }

  login(data: Login): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.URL}/login`, data).pipe(
      tap((response: TokenResponse) => {
        this.saveToken(response.access_token);
        // CORRECTION: Charger immédiatement l'utilisateur après sauvegarde du token
        this.loadUser().subscribe();
      })
    );
  }

  register(data: Register): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.URL}/register`, data).pipe(
      tap((response: TokenResponse) => {
        this.saveToken(response.access_token);
        this.loadUser().subscribe();
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.URL}/logout`, {}).pipe(
      tap(() => {
        this.removeToken();
        this.currentUserSubject.next(null);
      }),
      catchError(() => {
        // Même si l'API échoue, on nettoie localement
        this.removeToken();
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  saveToken(token: string) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('token');
    }
    return null;
  }

  removeToken() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
    }
    this.currentUserSubject.next(null);
  }

  getHeaders() {
    const token = this.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  //Version synchronisée de loadUser
  loadUser(): Observable<any> {
    if (!this.isAuthenticated()) {
      return of(null);
    }

    return this.http.get<any>(`${this.URL}/user`).pipe(
      tap((user) => {
        console.log('Utilisateur chargé:', user); // Debug
        this.currentUserSubject.next(user);
      }),
      catchError((error) => {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        // Si erreur 401, le token n'est plus valide
        if (error.status === 401) {
          this.removeToken();
        }
        return of(null);
      })
    );
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user && roles.includes(user.role);
  }

  // utilitaires pour ProduitService
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isClient(): boolean {
    return this.hasRole('CLIENT');
  }

  isEmploye(): boolean {
    return this.hasRole('EMPLOYE');
  }

  //pour attendre que l'utilisateur soit chargé
  waitForUserLoaded(): Observable<any> {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      return of(currentUser);
    }
    
    if (!this.isAuthenticated()) {
      return of(null);
    }

    return this.loadUser();
  }
}