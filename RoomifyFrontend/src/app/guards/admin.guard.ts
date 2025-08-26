// src/app/guards/admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // First check if user is logged in
    if (!this.authService.isLoggedIn()) {
      // Store the attempted URL for redirecting after login
      sessionStorage.setItem('returnUrl', state.url);
      this.router.navigate(['/profile/login']);
      return false;
    }

    // Then check if user has admin privileges
    if (this.authService.isAdmin()) {
      return true;
    }

    // User is logged in but not admin - redirect to home with message
    alert('Access denied. Admin privileges required.');
    this.router.navigate(['/home']);
    return false;
  }
}