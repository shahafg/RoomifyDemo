import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role } from '../models/role';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-users',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './register-users.component.html',
  styleUrl: './register-users.component.css'
})
export class RegisterUsersComponent {
  userRole : Role = 10;
  isAdmin: boolean = false;

  constructor() {
    this.updateUserRole();
    window.addEventListener('update', () => this.updateUserRole());
  }

  updateUserRole() {
    let userData = sessionStorage.getItem('loggedInUser');
    if (userData) {
      let user = JSON.parse(userData);
      this.userRole = user.role;
      if (this.userRole == 4)
        this.isAdmin = true;
    }
  }
}
