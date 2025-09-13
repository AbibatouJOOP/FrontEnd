import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Paiement } from '../../models/paiement';
import { PaiementService } from '../../services/paiement.service';

@Component({
  selector: 'app-paiement',
  standalone: true,
  imports: [
    CommonModule,
            RouterModule,
            FormsModule, 
  ],
  templateUrl: './paiement.component.html',
  styleUrl: './paiement.component.css'
})
export class PaiementComponent implements OnInit{
  paiementsFiltres: Paiement[] = [];
  ngOnInit(): void {
    this.getAll();
  }
  paiements : Paiement[] =[];
  constructor(
      private paiementSrvice : PaiementService
    ){}

    filtrerParDate(start: string, end: string) {
        const debutDate = new Date(start);
        const finDate = new Date(end);
        this.paiementsFiltres = this.paiements.filter(p => {
        const paiementDate = new Date(p.date_paiement);
        return paiementDate >= debutDate && paiementDate <= finDate;
  });
}
getAll(){
        this.paiementSrvice.getAll().subscribe(
          (data : Paiement[])=>{
            this.paiements = data;
            console.log(this.paiements);
          },
          (error)=>{
            console.log(error);
          }
        )
      }
}
