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

      this.isStudent = (this.userRole == 0) ? true : false;
      this.isRepresentative = (this.userRole == 1) ? true : false;
      this.isMaintenancePerson = (this.userRole == 2) ? true : false;
      this.isTeacher = (this.userRole == 3) ? true : false;
      this.isAdmin = (this.userRole == 4) ? true : false;
    } else {
      this.userRole = 10;
      this.isLoggedIn = false;
    }
  }
}
