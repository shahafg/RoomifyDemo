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
  role: Role = 0;

  constructor(private usersService: UsersService, private router: Router) {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser)
      this.router.navigateByUrl("/home");
  }

  register(): void {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match!';
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

    if (isRegistered)
      this.router.navigate(['/profile/login']);
    else
      this.errorMessage = 'User already exists!';
  }

  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
    }
  }
}