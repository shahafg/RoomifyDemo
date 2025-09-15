import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { CommonModule } from '@angular/common';
import { Role } from '../models/role';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
})

export class UserDetailsComponent {
  user: User | null = null;
  Role = Role; 
  userRole: string = "";

  constructor(private router: Router) {
    const userData = sessionStorage.getItem('loggedInUser');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      this.user = new User(
        parsedUser.id,
        parsedUser.email,
        parsedUser.password,
        parsedUser.fullName,
        new Date(parsedUser.dateOfBirth),
        parsedUser.gender,
        parsedUser.image,
        parsedUser.role
      );
      this.userRole = Role[this.user.getRole()];
      this.userRole = this.userRole.charAt(0).toUpperCase() + this.userRole.slice(1).toLowerCase();
    } else {
      this.router.navigateByUrl('/profile/login');
    }
  }

  showGender(): string {
    return this.user?.getGender() == "male" ? "Male" : "Female";
  }
}
