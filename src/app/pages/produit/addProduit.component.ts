import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Categorie } from '../../models/categorie';
import { CategorieService } from '../../services/categorie.service';
import { ProduitService } from '../../services/produit.service';

@Component({
  selector: 'app- addProduit',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './addProduit.component.html',
  styleUrl: './produit.component.css'
})
export class AddProduitComponent {
  form: FormGroup;
  categories: Categorie[] = [];
  isEditMode = false;
  produitId: number | null = null;
  isLoading = false;
  isLoadingCategories = true;
  error: string | null = null;
  selectedFile!: File;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  constructor(
    private fb: FormBuilder,
    private produitService: ProduitService,
    private categorieService: CategorieService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      prix: ['', [Validators.required, Validators.min(0.01)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      image: [''],
      categorie_id: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Vérifier si on est en mode édition
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.produitId = Number(id);
      this.isEditMode = true;
    }

    // Charger les catégories
    this.loadCategories();

    // Si mode édition, charger le produit
    if (this.isEditMode && this.produitId) {
      this.loadProduit();
    }
  }

  loadCategories(): void {
    this.isLoadingCategories = true;
    this.categorieService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoadingCategories = false;
        console.log('Catégories chargées:', categories);
      },
      error: (error) => {
        this.isLoadingCategories = false;
        console.error('Erreur chargement catégories:', error);
        this.error = 'Erreur lors du chargement des catégories.';
      }
    });
  }

  loadProduit(): void {
    if (this.produitId) {
      this.isLoading = true;
      this.produitService.getById(this.produitId).subscribe({
        next: (produit) => {
          this.form.patchValue({
            nom: produit.nom,
            description: produit.description,
            prix: produit.prix,
            stock: produit.stock,
            image: produit.image,
            categorie_id: produit.categorie_id
          });
          this.isLoading = false;
          console.log('Produit chargé pour modification:', produit);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erreur chargement produit:', error);
          this.error = 'Erreur lors du chargement du produit.';
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading = true;
      this.error = null;

      // Préparer FormData
      const formData = new FormData();
      formData.append('nom', this.form.value.nom);
      formData.append('description', this.form.value.description);
      formData.append('prix', this.form.value.prix);
      formData.append('stock', this.form.value.stock);
      formData.append('categorie_id', this.form.value.categorie_id);

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      let operation;
      if (this.isEditMode && this.produitId) {
        operation = this.produitService.updateProduit(formData, this.produitId); 
      } else {
        console.log("salut");
        operation = this.produitService.addProduit(formData); 

      }

      operation.subscribe({
        next: (result) => {
          this.isLoading = false;
          console.log('Produit sauvegardé:', result);
          this.router.navigate(['/admin/produit']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erreur sauvegarde:', error);

          if (error.status === 422) {
            this.error = 'Données invalides. Vérifiez les champs.';
          } else if (error.status === 403) {
            this.error = 'Vous n\'avez pas les permissions pour cette action.';
          } else {
            this.error = 'Erreur lors de la sauvegarde. Veuillez réessayer.';
          }
        }
      });
    } else {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }


  // Méthodes utilitaires pour le template
  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} est requis.`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} doit contenir au moins ${field.errors['minlength'].requiredLength} caractères.`;
      }
      if (field.errors['min']) {
        return `${fieldName} doit être supérieur à ${field.errors['min'].min}.`;
      }
    }
    return '';
  }

  cancel(): void {
    this.router.navigate(['/admin/produit']);
  }
}

