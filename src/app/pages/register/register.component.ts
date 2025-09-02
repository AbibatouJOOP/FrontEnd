import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TokenResponse } from '../../models/token-response';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
form: FormGroup; 
   
    constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) { 
      this.form = this.fb.group({ 
          nomComplet: ['', Validators.required],  
          email: ['', [Validators.required, Validators.email]], 
          password: ['', [Validators.required, Validators.minLength(8)]], 
          role: ['CLIENT'] 
        });
      }
   
    register() { 
      if (this.form.valid) { 
        this.auth.register(this.form.value).subscribe({ 
          next: (res : TokenResponse) => { 
            this.auth.saveToken(res.access_token);
            this.router.navigate(['/login']); 
          }, 
          error: err => alert("Identifiants incorrects") 
        });
      }
    }
}

