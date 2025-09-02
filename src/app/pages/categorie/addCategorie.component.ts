import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategorieService } from '../../services/categorie.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-addCategorie',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './addCategorie.component.html',
  styleUrl: './categorie.component.css'
})
export class AddCategorieComponent {
  id!: number;
  submetted = false;
  categorieForm: FormGroup = new FormGroup({
    nom: new FormControl('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl('', [Validators.required]),
  });

  constructor(
    private categorieService: CategorieService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    if (this.route.snapshot.paramMap.get('id')) {
      this.id = this.route.snapshot.params['id'];
      this.getById(this.id);
    }
  }

  getById(id: number) {
    console.log('🔍 Récupération catégorie ID:', id);
    this.categorieService.getById(this.id).subscribe(
      (data) => {
        console.log('✅ Catégorie récupérée:', data);
        this.categorieForm.patchValue(data);
      },
      (error) => {
        console.error('❌ Erreur récupération catégorie:', error);
      }
    )
  }

  get f2() {
    return this.categorieForm.controls;
  }

  onSubmit() {
    this.submetted = true;
    console.log('=== DÉBUT SOUMISSION ===');
    console.log('Formulaire valide:', this.categorieForm.valid);
    console.log('ID présent:', this.id);
    console.log('Valeurs du formulaire:', this.categorieForm.value);
    
    if (this.categorieForm.valid) {
      if (this.id) {
        console.log('🔄 Tentative de modification...');
        this.categorieService.updateCategorie(this.categorieForm.value, this.id).subscribe(
          (response) => {
            console.log('✅ Modification réussie:', response);
            // ✅ CORRECTION: Navigation vers la route admin
            this.router.navigate(['/admin/categorie']);
          },
          (error) => {
            console.error('❌ Erreur modification:', error);
          }
        )
      } else {
        console.log('🔄 Tentative d\'ajout...');
        this.categorieService.addCategorie(this.categorieForm.value).subscribe(
          (response) => {
            console.log('✅ Ajout réussi:', response);
            // ✅ CORRECTION: Navigation vers la route admin
            this.router.navigate(['/admin/categorie']);
          },
          (error) => {
            console.error('❌ Erreur ajout:', error);
          }
        )
      }
    } else {
      console.log('❌ Formulaire invalide:', this.categorieForm.errors);
      // ✅ AJOUT: Afficher les erreurs de chaque champ
      Object.keys(this.categorieForm.controls).forEach(key => {
        const control = this.categorieForm.get(key);
        if (control && control.invalid) {
          console.log(`❌ Champ ${key} invalide:`, control.errors);
        }
      });
    }
  }
}
