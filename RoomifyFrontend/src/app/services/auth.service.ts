// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Role } from '../models/role';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor() {
    // Check if user is already logged in from sessionStorage
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser) {
      this.isLoggedInSubject.next(true);
    }
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    const isLoggedIn = !!loggedInUser;
    this.isLoggedInSubject.next(isLoggedIn);
    return isLoggedIn;
  }

  // Update login status (call this after successful login)
  setLoggedIn(status: boolean): void {
    this.isLoggedInSubject.next(status);
  }

  // Get current user data
  getCurrentUser(): any {
    const userData = sessionStorage.getItem('loggedInUser');
    return userData ? JSON.parse(userData) : null;
  }

  // Logout user
  logout(): void {
    sessionStorage.removeItem('loggedInUser');
    this.isLoggedInSubject.next(false);
  }

  // Check if user has admin role (role = 4)
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    console.log('Current user:', user); // Debug log
    console.log('User role:', user?.role); // Debug log
    return user && user.role === Role.admin; // Role.admin = 4
  }

  // Check specific role
  hasRole(role: Role): boolean {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  // Check if user has role equal or higher than specified role
  hasMinimumRole(minRole: Role): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Lower role numbers = higher privileges (admin=4, teacher=3, etc.)
    return user.role <= minRole;
  }
}