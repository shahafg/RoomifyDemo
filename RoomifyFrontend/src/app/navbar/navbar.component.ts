import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuditLogService } from '../services/audit-log.service';

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

  constructor(
    private router: Router,
    private auditLogService: AuditLogService
  ) {
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
    // Get current user data before logging out for audit log
    const userData = sessionStorage.getItem('loggedInUser');
    let user = null;
    if (userData) {
      user = JSON.parse(userData);
    }

    // Create audit log for logout
    if (user) {
      this.auditLogService.createAuditLog({
        action: 'LOGOUT',
        entity: 'USER',
        entityId: user.id?.toString() || '',
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        details: `User ${user.email} logged out`,
        success: true,
        severity: 'LOW'
      }).catch(error => {
        console.error('Failed to create audit log for logout:', error);
      });
    }

    sessionStorage.removeItem('loggedInUser');
    this.isAdmin = false;
    this.isLoggedIn = false;
    this.router.navigateByUrl('/profile/login');
  }
}
