// src/app/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { AuthService } from '../services/auth.service'; // Add this import
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder, 
    private usersService: UsersService, 
    private authService: AuthService, // Add AuthService
    private router: Router
  ) {
    // Check if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl("/home");
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  login(): void {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    this.usersService.login(email, password).subscribe(user => {
      if (user) {
        sessionStorage.setItem('loggedInUser', JSON.stringify(user));
        
        // Update AuthService status
        this.authService.setLoggedIn(true);
        
        // Check for return URL
        const returnUrl = sessionStorage.getItem('returnUrl') || '/home';
        sessionStorage.removeItem('returnUrl');
        
        this.router.navigateByUrl(returnUrl).then(() => {
          window.location.reload();
        });
      } else {
        this.errorMessage = 'Invalid email or password!';
      }
    });
  }

  goToRegister(): void {
    this.router.navigateByUrl('/profile/register');
  }
}