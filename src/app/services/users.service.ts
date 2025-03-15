import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { Observable, of } from 'rxjs';
import { Role } from '../models/role';

@Injectable({
  providedIn: 'root',
})

export class UsersService {
  users: User[] = [];

  constructor() {
    this.users = [
      new User('john.doe@example.com', '53SDrdDSA123', 'John Doe', new Date('1990-01-01'), 'male', undefined, 4),
      new User('david.wilson@example.com', 'LO98QwER789', 'David Wilson', new Date('1988-11-30'), 'male', undefined, 3),
      new User('mike.smith@example.com', 'SD43FgTR123', 'Mike Smith', new Date('1985-03-12'), 'male', undefined, 2),
      new User('emily.jones@example.com', 'HG76DdRR456', 'Emily Jones', new Date('1995-07-22'), 'female', undefined, 1),
      new User('jane.doe@example.com', 'SDrdDSAS123', 'Jane Doe', new Date('1992-05-15'), 'female', undefined, 0),
    ];
  }

  registerUser(email: string, password: string, fullName: string, dateOfBirth: Date, gender: 'male' | 'female', image: File | null, role: Role): boolean {
    const userExists = this.users.some(user => user.getEmail() === email);
    if (userExists) return false;

    let imagePath = '';
    const src = 'assets/images/profile/';
    if (image) {
      imagePath = URL.createObjectURL(image);
    } else {
      imagePath = gender === 'male' ? src + 'male.jpg' : src + 'female.jpg';
    }

    const newUser = new User(email, password, fullName, dateOfBirth, gender, imagePath, role);
    this.users.push(newUser);
    return true;
  }

  login(email: string, password: string): Observable<User | null> {
    const user = this.users.find((user) => user.getEmail() === email && user.getPassword() === password);
    return of(user || null);
  }
  getUserByEmail(email: string): Observable<User | null> {
    const user = this.users.find((user) => user.getEmail() === email);
    return of(user || null);
  }
  getAllUsers(): Observable<User[]> {
    return of(this.users);
  }
}