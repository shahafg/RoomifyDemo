import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { AuthService } from '../services/auth.service';
import { AuditLogService } from '../services/audit-log.service';
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
    private authService: AuthService,
    private auditLogService: AuditLogService,
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

        // Create audit log for successful login
        this.auditLogService.createAuditLog({
          action: 'LOGIN',
          entity: 'USER',
          entityId: user.id?.toString() || '',
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
          details: `User ${user.email} logged in successfully`,
          success: true,
          severity: 'LOW'
        }).catch(error => {
          console.error('Failed to create audit log for login:', error);
        });
        
        // Check for return URL
        const returnUrl = sessionStorage.getItem('returnUrl') || '/home';
        sessionStorage.removeItem('returnUrl');
        
        this.router.navigateByUrl(returnUrl).then(() => {
          window.location.reload();
        });
      } else {
        // Create audit log for failed login
        this.auditLogService.createAuditLog({
          action: 'LOGIN',
          entity: 'USER',
          userEmail: email,
          details: `Failed login attempt for email: ${email}`,
          success: false,
          severity: 'MEDIUM'
        }).catch(error => {
          console.error('Failed to create audit log for failed login:', error);
        });

        this.errorMessage = 'Invalid email or password!';
      }
    });
  }

  goToRegister(): void {
    this.router.navigateByUrl('/profile/register');
  }
}