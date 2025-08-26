import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { FormsModule } from '@angular/forms';
import { Role } from '../models/role';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [FormsModule],
  styleUrls: ['./register.component.css'],
})

export class RegisterComponent {
  email = '';
  password = '';
  confirmPassword = '';
  fullName = '';
  dateOfBirth: string = '';
  gender: 'male' | 'female' = 'male';
  errorMessage = '';
  imageFile: File | null = null;
  role: Role = 10;

  constructor(private usersService: UsersService, private router: Router) { }

  register(): void {
    // Email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address!';
      return;
    }

    // Password confirmation
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match!';
      return;
    }

    // Password strength
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(this.password)) {
      this.errorMessage = 'Password must be at least 8 characters long and contain at least one number.';
      return;
    }

    // Full name validation
    if (!this.fullName || this.fullName.trim().length === 0) {
      this.errorMessage = 'Full name cannot be empty!';
      return;
    }

    // Date of birth validation
    const currentDate = new Date();
    const enteredDate = new Date(this.dateOfBirth);
    if (
      !this.dateOfBirth ||
      isNaN(enteredDate.getTime()) ||
      enteredDate > currentDate ||
      enteredDate < new Date(currentDate.setFullYear(currentDate.getFullYear() - 100))
    ) {
      this.errorMessage = 'Please enter a valid date of birth!';
      return;
    }

    // Gender validation
    if (!this.gender) {
      this.errorMessage = 'Please select a gender!';
      return;
    }

    // Image validation (optional)
    if (this.imageFile && !(this.imageFile instanceof File)) {
      this.errorMessage = 'Please upload a valid image file!';
      return;
    }

    // Call service to register and save to DB
    this.usersService
      .registerUser(
        this.email,
        this.password,
        this.fullName,
        new Date(this.dateOfBirth),
        this.gender,
        this.imageFile,
        this.role
      )
      .subscribe({
        next: () => {
          // ✅ Success
          this.router.navigateByUrl('/home');
        },
        error: (err) => {
          console.error('Registration error:', err);

          if (err.status === 0) {
            this.errorMessage =
              'Cannot connect to server. Please check if backend is running.';
          } else if (err.status === 400) {
            this.errorMessage = 'Invalid request. Please check your input fields.';
          } else if (err.status === 409) {
            this.errorMessage = 'User with this email already exists!';
          } else if (err.status === 500) {
            this.errorMessage = 'Server error. Please try again later.';
          } else {
            this.errorMessage = `Unexpected error (${err.status}): ${err.message}`;
          }
        },
      });
  }

  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
    }
  }
}