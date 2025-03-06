import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
})
export class UserDetailsComponent {
  user: User | null = null;

  constructor(private router: Router) {
    const userData = sessionStorage.getItem('loggedInUser');
    if (userData)
      this.user = JSON.parse(userData);
    else
      this.router.navigate(['/profile/login']);

  }
  showGender(): string {
    return this.user?.gender == "male" ? "Male" : "Female";
  }
}
