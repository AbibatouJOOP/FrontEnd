import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { User } from '../models/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly URL = "http://127.0.0.1:8000/api/users";

  constructor(
      private httpClient : HttpClient,
      private authService : AuthService
    ) { }
    getAll(): Observable<User[]>{
      return this.httpClient.get<User[]>(this.URL);
    }
  
    addUser(user: User): Observable<User>{
      return this.httpClient.post<User>(this.URL,user);
    }
  
    updateUser(user: User, id: number): Observable<User> {
        return this.httpClient.put<User>(`${this.URL}/${id}`, user);
      }
  
    deleteUser(id: number): Observable<any> {
    return this.httpClient.delete(`${this.URL}/${id}`);
  }
  
    getById(id: number): Observable<User> {
        return this.httpClient.get<User>(`${this.URL}/${id}`);
      }
    getByEmail(email: string){
      return this.httpClient.get<User>(this.URL+"/"+email);
    }  
}
