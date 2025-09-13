import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { User } from '../../models/user';

@Component({
  selector: 'app-addUser',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './addUser.component.html',
  styleUrl: './user.component.css'
})
export class AddUserComponent implements OnInit {
  id!: number;
  submitted=false;
  errorMessage: string = '';

   userForm: FormGroup=new FormGroup(
    {
      email: new FormControl('', [Validators.required]),
      nomComplet: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      role: new FormControl('', [Validators.required]),
    }
  );

  ngOnInit(): void {
      if(this.route.snapshot.paramMap.get('id')){
      this.id=this.route.snapshot.params['id'];
      this.getById(this.id as number);
    }
  }
  constructor(private httpClient : HttpClient, private userService: UserService, private router : Router, private route : ActivatedRoute){

  }
  get f2(){
    return this.userForm.controls;
  }
  getById(id: number){
    this.userService.getById(id).subscribe(
      (data: User)=>{
        //console.log(data);
        this.userForm.patchValue(data);
      },
      (error)=>{
        console.log(error);
      }
    )
  }

  onSubmit(){
    this.submitted=true;
    if(this.userForm.valid){
      if(this.id){
        this.userService.updateUser(this.userForm.value,this.id).subscribe(
          ()=>{
            console.log("success");
            this.router.navigateByUrl('users');
          },
          (error)=>{
            this.errorMessage = error.error; 
            console.log(error);
          }
        )
      }else{
        
        this.userService.addUser(this.userForm.value).subscribe(
          ()=>{
            console.log("success");
            this.router.navigateByUrl('utilisateur');
          },
          (error)=>{
            console.log(error);
          }
        )
      } 
    }
  } }
