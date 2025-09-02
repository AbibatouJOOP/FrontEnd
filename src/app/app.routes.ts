import { Routes } from '@angular/router';
import { CategorieComponent } from './pages/categorie/categorie.component';
import { ProduitComponent } from './pages/produit/produit.component';
import { AddCategorieComponent } from './pages/categorie/addCategorie.component';
import { AddProduitComponent } from './pages/produit/addProduit.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { ClientDashboardComponent } from './pages/client-dashboard/client-dashboard.component';
import { CatalogueComponent } from './pages/catalogue/catalogue.component';
import { CommandeComponent } from './pages/commande/commande.component';
import { PanierComponent } from './pages/panier/panier.component';
import { ValiderCommandeComponent } from './pages/valider-commande/valider-commande.component';
import { EmployeDashboardComponent } from './pages/employe-dashboard/employe-dashboard.component';
import { PromotionComponent } from './pages/promotion/promotion.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // AJOUT: Route par défaut
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Routes pour ADMIN
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: 'categorie', component: CategorieComponent},
      { path: 'addCategorie', component: AddCategorieComponent,  },
      { path: 'updateCategorie/:id', component: AddCategorieComponent,},
      { path: 'produit', component: ProduitComponent, },
      { path: 'addProduit', component: AddProduitComponent,},
      { path: 'updateProduit/:id', component: AddProduitComponent,},
      { path: 'commande', component: CommandeComponent },
      { path: 'promotion', component: PromotionComponent },
      { path: '', redirectTo: 'categorie', pathMatch: 'full' }
    ]
  },

  // Routes pour CLIENT
  {
    path: 'client',
    component: ClientDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['CLIENT'] },
    children: [
      { path: 'catalogue', component: CatalogueComponent },
      { path: 'commande', component: CommandeComponent },
      { path: 'panier', component: PanierComponent },
      { path: 'validerCommande', component: ValiderCommandeComponent },  
      { path: '', redirectTo: 'catalogue', pathMatch: 'full' }
    ]
  },

  // Routes pour EMPLOYE
  {
    path: 'employe',
    component: EmployeDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['EMPLOYE'] },
    children: [
      { path: 'commande', component: CommandeComponent },
    ]
  },

  // AJOUT: Page d'erreur pour accès non autorisé
  { 
    path: 'unauthorized', 
    component: LoginComponent 
  },
  
  // AJOUT: Route wildcard pour les 404
  { path: '**', redirectTo: '/login' }
];