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

  constructor(private usersService: UsersService, private router: Router) {
    //const loggedInUser = sessionStorage.getItem('loggedInUser');
    // if (loggedInUser)
    //   this.router.navigateByUrl("/home");
  }

  register(): void {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address!';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match!';
      return;
    }

    // At least 8 characters, 1 letter, and 1 number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(this.password)) {
      this.errorMessage = 'Password must be at least 8 characters long and contain at least one number.';
      return;
    }

    if (!this.fullName || this.fullName.trim().length === 0) {
      this.errorMessage = 'Full name cannot be empty!';
      return;
    }

    const currentDate = new Date();
    const enteredDate = new Date(this.dateOfBirth);
    
    // Check if the date is valid, within the last 5 years, and not in the future
    if (!this.dateOfBirth || isNaN(enteredDate.getTime()) || enteredDate > currentDate || enteredDate < new Date(currentDate.setFullYear(currentDate.getFullYear() - 5))) {
      this.errorMessage = 'Please enter a valid date of birth!';
      return;
    }

    if (!this.gender) {
      this.errorMessage = 'Please select a gender!';
      return;
    }

    // Check if an image file is provided (optional)
    if (this.imageFile && !(this.imageFile instanceof File)) {
      this.errorMessage = 'Please upload a valid image file!';
      return;
    }

    const isRegistered = this.usersService.registerUser(
      this.email,
      this.password,
      this.fullName,
      new Date(this.dateOfBirth),
      this.gender,
      this.imageFile,
      this.role
    );

    if (isRegistered) {
      this.router.navigateByUrl('/profile/login');
    } else {
      this.errorMessage = 'User already exists!';
    }
  }

  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
    }
  }
}