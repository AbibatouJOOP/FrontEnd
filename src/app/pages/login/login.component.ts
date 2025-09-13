import { Component } from '@angular/core';
import { TokenResponse } from '../../models/token-response';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
   
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  form: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login() {
    if (this.form.valid) {
      this.isLoading = true;
      console.log('connexion valide');
      
      this.auth.login(this.form.value).subscribe({
        next: (res: TokenResponse) => {
          console.log('Token reçu:', res.access_token);
          
          // méthode pour attendre l'utilisateur
          this.auth.waitForUserLoaded().subscribe({
            next: (user) => {
              this.isLoading = false;
              console.log('Utilisateur final:', user);
              console.log('Rôle de l\'utilisateur:', user?.role);
              
              if (user?.role === 'ADMIN') {
                this.router.navigate(['/admin']);
              } else if (user?.role === 'EMPLOYE') {
                this.router.navigate(['/employe']);
              } else if (user?.role === 'CLIENT') {
                this.router.navigate(['/client']);
              } else {
                // Par défaut, rediriger vers login si pas de rôle spécifique
                this.router.navigate(['/login']);
              }
            },
            error: (err) => {
              this.isLoading = false;
              console.error('Erreur chargement utilisateur:', err);
              // En cas d'erreur, rediriger quand même
              this.router.navigate(['/login']);
            }
          });
        },
        error: err => {
          this.isLoading = false;
          console.error('Erreur de connexion:', err);
          alert("Identifiants incorrects");
        }
      });
    }
  }
}