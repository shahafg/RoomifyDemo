import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { map, Observable, of } from 'rxjs';
import { Role } from '../models/role';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  users: User[] = [];
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserByEmail(email: string): Observable<User | null> {
    return this.http.get<User>(`${this.apiUrl}?email=${email}`);
  }

  login(email: string, password: string): Observable<User | null> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(users => {
        const found = users.find(u =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password
        );

        if (!found) return null;

        return new User(
          found.email,
          found.password,
          found.fullName,
          new Date(found.dateOfBirth),
          found.gender,
          found.image,
          found.role
        );
      })
    );
  }

  registerUser(
    email: string,
    password: string,
    fullName: string,
    dateOfBirth: Date,
    gender: 'male' | 'female',
    image: File | null,
    role: Role
  ): boolean {
    const userExists = this.users.some(user => user.getEmail() === email);
    if (userExists) return false;

    let imagePath = '';
    const src = 'assets/images/profile/';
    if (image) {
      imagePath = URL.createObjectURL(image);
    } else {
      imagePath = gender === 'male' ? src + 'male.jpg' : src + 'female.jpg';
    }

    const newUser = new User(
      email,
      password,
      fullName,
      dateOfBirth,
      gender,
      imagePath,
      role
    );

    this.users.push(newUser);
    return true;
  }

}
