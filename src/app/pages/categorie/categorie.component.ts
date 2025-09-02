import { Component } from '@angular/core';
import { Categorie } from '../../models/categorie';
import { CategorieService } from '../../services/categorie.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-categorie',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    RouterLink
  ],
  templateUrl: './categorie.component.html',
  styleUrl: './categorie.component.css'
})
export class CategorieComponent {
categories : Categorie[] =[];
  
  constructor(private categorieService : CategorieService,
    private route : Router
  ){

  }

  ngOnInit():void {
    this.getAll();
  }


  getAll(){
    this.categorieService.getAll().subscribe(
      (data : Categorie[])=>{
        this.categories = data;
        console.log(data);
      },
      (error)=>{
        console.log(error);
      }
    )
  }

  deleteCategorie(id: number){
    this.categorieService.deleteCategorie(id).subscribe(
      ()=>{
        this.getAll();
      },
      (error)=>{
        console.log(error);
      }
    )
  }


}
