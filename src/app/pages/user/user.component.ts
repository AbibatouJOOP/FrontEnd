import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [HttpClientModule,
    CommonModule,
    RouterLink],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit{
users : User[] =[];
  ngOnInit(): void {
   this.getAll();
  }
  constructor(
    private userService : UserService
  ){}
  getAll(){
      this.userService.getAll().subscribe(
        (data : User[])=>{
          this.users = data;
          console.log(data);
        },
        (error)=>{
          console.log(error);
        }
      )
    }
    deleteUser(id:number){
    this.userService.deleteUser(id).subscribe(
      ()=>{
        
        this.getAll();
      },
      (error)=>{
        console.log(error)
      }
    ) 
  }
}
