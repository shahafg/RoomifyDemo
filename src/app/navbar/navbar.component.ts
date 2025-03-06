import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})

export class NavbarComponent {
  isAdmin: boolean = false;
  isLoggedIn: boolean = false;
  profileImage: string = 'assets/images/profile/male.jpg';

  constructor(private router: Router) {
    this.updateAdminStatus();
    window.addEventListener('update', () => this.updateAdminStatus());
  }

  updateAdminStatus() {
    let userData = sessionStorage.getItem('loggedInUser');
    if (userData) {
      let user = JSON.parse(userData);
      this.isAdmin = user.role == 4 ? true : false;
      this.isLoggedIn = true;
      this.profileImage = user.image || 'assets/images/profile/male.jpg';
    } else {
      this.isAdmin = false;
      this.isLoggedIn = false;
    }
  }

  logout() {
    sessionStorage.removeItem('loggedInUser');
    this.isAdmin = false;
    this.isLoggedIn = false;
    this.router.navigate(['/profile/login']);
  }
}
