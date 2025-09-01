import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { map, Observable } from 'rxjs';
import { Role } from '../models/role';

interface BulkRegistrationResult {
  message: string;
  results: {
    successful: Array<{ index: number; email: string; id: string }>;
    failed: Array<{ index: number; email: string; error: string }>;
    total: number;
  };
}

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
  ): Observable<User> {
    let imagePath = '';
    const src = 'assets/images/profile/';
    if (image) {
      imagePath = URL.createObjectURL(image);
    } else {
      imagePath = gender === 'male' ? src + 'male.jpg' : src + 'female.jpg';
    }

    const newUser = {
      email,
      password,
      fullName,
      dateOfBirth,
      gender,
      image: imagePath,
      role
    };

    return this.http.post<User>(this.apiUrl + "/register", newUser);
  }

  bulkRegisterUsers(users: any[]): Observable<BulkRegistrationResult> {
    return this.http.post<BulkRegistrationResult>(this.apiUrl + "/bulk-register", { users });
  }
}