import { Component } from '@angular/core';
import { Role } from '../models/role';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  userRole : Role = 10;
  isLoggedIn: boolean = false;
  isStudent: boolean = false;
  isRepresentative: boolean = false;
  isMaintenancePerson: boolean = false;
  isTeacher: boolean = false;
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
      this.isLoggedIn = true;

      if (this.userRole == 0) {
        this.isStudent = true;
        return;
      }
      else if (this.userRole == 1) {
        this.isRepresentative = true;
        return;
      }
      else if (this.userRole == 2) {
        this.isMaintenancePerson = true;
        return;
      }
      else if (this.userRole == 3) {
        this.isTeacher = true;
        return;
      }
      else if (this.userRole == 4) {
        this.isAdmin = true;
        return;
      }
    } else {
      this.userRole = 10;
      this.isLoggedIn = false;
    }
  }
}
