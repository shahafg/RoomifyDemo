// src/app/register-users/register-users.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role } from '../models/role';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Add this import

@Component({
  selector: 'app-register-users',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './register-users.component.html',
  styleUrl: './register-users.component.css'
})
export class RegisterUsersComponent {
  userRole: Role = 10;
  isAdmin: boolean = false;

  constructor(private authService: AuthService) { // Inject AuthService
    this.updateUserRole();
    window.addEventListener('update', () => this.updateUserRole());
  }

  updateUserRole() {
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.userRole = user.role;
        this.isAdmin = this.authService.isAdmin();
      }
    }
  }
}