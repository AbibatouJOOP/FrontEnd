import { Component, OnInit } from '@angular/core';
import { LivraisonService } from '../../services/livraison.service';
import { Livraison } from '../../models/livraison';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-livraison',
  standalone: true,
  imports: [
     CommonModule,
        RouterModule,
        FormsModule, 
  ],
  templateUrl: './livraison.component.html',
  styleUrl: './livraison.component.css'
})
export class LivraisonComponent implements OnInit{
  livraisons : Livraison[] =[];
  livraisonsFiltrees: any[] = [];


constructor(
    private livraisonService : LivraisonService
  ){}

  ngOnInit(): void {
    this.getAll();
  }
  getAll(){
        this.livraisonService.getAll().subscribe(
          (data : Livraison[])=>{
            this.livraisons = data;
            this.livraisonsFiltrees = [...this.livraisons];
            console.log(data);
          },
          (error)=>{
            console.log(error);
          }
        )
      }

}
