// src/app/missing-page/missing-page.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-missing-page',
  standalone: true,
  imports: [],
  templateUrl: './missing-page.component.html',
  styleUrl: './missing-page.component.css'
})
export class MissingPageComponent {
  
  constructor(private router: Router) {}

  goToHomepage(): void {
    this.router.navigate(['/home']);
  }
}