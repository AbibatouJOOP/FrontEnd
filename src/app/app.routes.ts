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
import { UserComponent } from './pages/user/user.component';
import { AddUserComponent } from './pages/user/addUser.component';
import { LivraisonComponent } from './pages/livraison/livraison.component';
import { PaiementComponent } from './pages/paiement/paiement.component';
import { ChatComponent } from './pages/chat/chat.component';
import { CommandeClientComponent } from './pages/commande/commandeclient.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { AccueilComponent } from './pages/accueil/accueil.component';

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
      { path: 'acceuil', component: AccueilComponent },
      { path: 'utilisateur', component: UserComponent},
      { path: 'addUser', component: AddUserComponent, },
      { path: 'updateUser/:id', component: AddUserComponent, },
      { path: 'categorie', component: CategorieComponent},
      { path: 'addCategorie', component: AddCategorieComponent,  },
      { path: 'updateCategorie/:id', component: AddCategorieComponent,},
      { path: 'produit', component: ProduitComponent, },
      { path: 'addProduit', component: AddProduitComponent,},
      { path: 'updateProduit/:id', component: AddProduitComponent,},
      { path: 'commandes', component: CommandeComponent },
      { path: 'promotion', component: PromotionComponent },
      { path: 'livraison', component: LivraisonComponent, },
      { path: 'paiements', component: PaiementComponent, },
      { path: 'chats', component: ChatComponent, },
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
      { path: 'acceuil', component: AccueilComponent },
      { path: 'catalogue', component: CatalogueComponent },
      { path: 'commande', component: CommandeComponent },
      { path: 'mes-commandes', component: CommandeClientComponent },
      { path: 'panier', component: PanierComponent },
      { path: 'validerCommande', component: ValiderCommandeComponent },
      { path: 'chats', component: ChatComponent, },  
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
      { path: 'chats', component: ChatComponent, },  
      { path: 'acceuil', component: AccueilComponent },
      { path: 'commande', component: CommandeComponent },
      { path: 'livraison', component: LivraisonComponent, },
      { path: 'paiements', component: PaiementComponent, },
    ]
  },

  // AJOUT: Page d'erreur pour accès non autorisé
  { 
    path: 'unauthorized', 
    component: UnauthorizedComponent 
  },
  
  // AJOUT: Route wildcard pour les 404
  { path: '**', redirectTo: '/login' }
];