// bulk-register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { Role } from '../models/role';

interface UserRegistrationData {
  email: string;
  password: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  image?: string;
  role?: Role;
}

interface RegistrationResult {
  user: UserRegistrationData;
  success: boolean;
  error?: string;
}

@Component({
  selector: 'app-bulk-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <h2>Register Users from JSON</h2>
      
      <div class="mb-4">
        <h5>Instructions:</h5>
        <p>Upload a JSON file with an array of user objects. Each user should have the following structure:</p>
        <pre class="bg-light p-3 rounded">
{{ '{' }}
  "users": [
    {{ '{' }}
      "email": "user&#64;example.com",
      "password": "password123",
      "fullName": "John Doe",
      "dateOfBirth": "1990-01-15",
      "gender": "male",
      "role": 0
    {{ '}' }}
  ]
{{ '}' }}
        </pre>
      </div>

      <div class="mb-3">
        <label for="jsonFile" class="form-label">Select JSON File</label>
        <input 
          type="file" 
          id="jsonFile" 
          accept=".json" 
          (change)="onFileSelected($event)" 
          class="form-control"
        />
      </div>

      <div *ngIf="selectedFile" class="mb-3">
        <p><strong>Selected file:</strong> {{ selectedFile.name }}</p>
        <button 
          type="button" 
          class="btn btn-primary me-2" 
          (click)="previewUsers()"
          [disabled]="isProcessing"
        >
          Preview Users
        </button>
      </div>

      <div *ngIf="previewData.length > 0" class="mb-4">
        <h5>Preview ({{ previewData.length }} users found):</h5>
        <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
          <table class="table table-striped table-sm">
            <thead>
              <tr>
                <th>Email</th>
                <th>Full Name</th>
                <th>Date of Birth</th>
                <th>Gender</th>
                <th>Role</th>
                <th>Validation</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of previewData; let i = index" 
                  [class.table-danger]="!isValidUser(user)"
                  [class.table-success]="isValidUser(user)">
                <td>{{ user.email }}</td>
                <td>{{ user.fullName }}</td>
                <td>{{ user.dateOfBirth }}</td>
                <td>{{ user.gender }}</td>
                <td>{{ user.role || 10 }}</td>
                <td>
                  <span *ngIf="isValidUser(user)" class="badge bg-success">Valid</span>
                  <span *ngIf="!isValidUser(user)" class="badge bg-danger">Invalid</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="mt-3">
          <button 
            type="button" 
            class="btn btn-success me-2" 
            (click)="registerAllUsers()"
            [disabled]="isProcessing || validUsers.length === 0"
          >
            <span *ngIf="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
            Register {{ validUsers.length }} Valid Users
          </button>
          <button type="button" class="btn btn-secondary" (click)="clearPreview()">
            Clear
          </button>
        </div>
      </div>

      <div *ngIf="registrationResults.length > 0" class="mt-4">
        <h5>Registration Results:</h5>
        <div class="alert alert-info">
          <strong>Summary:</strong> 
          {{ successCount }} successful, {{ errorCount }} failed out of {{ registrationResults.length }} total
        </div>
        
        <div class="accordion" id="resultsAccordion">
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" 
                      data-bs-toggle="collapse" data-bs-target="#successResults">
                Successful Registrations ({{ successCount }})
              </button>
            </h2>
            <div id="successResults" class="accordion-collapse collapse">
              <div class="accordion-body">
                <ul class="list-group">
                  <li *ngFor="let result of successfulResults" class="list-group-item list-group-item-success">
                    {{ result.user.fullName }} ({{ result.user.email }})
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="accordion-item" *ngIf="errorCount > 0">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" 
                      data-bs-toggle="collapse" data-bs-target="#errorResults">
                Failed Registrations ({{ errorCount }})
              </button>
            </h2>
            <div id="errorResults" class="accordion-collapse collapse">
              <div class="accordion-body">
                <ul class="list-group">
                  <li *ngFor="let result of failedResults" class="list-group-item list-group-item-danger">
                    <strong>{{ result.user.fullName }} ({{ result.user.email }})</strong><br>
                    <small class="text-danger">{{ result.error }}</small>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger mt-3">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styleUrl: './bulk-register.component.css'
})
export class BulkRegisterComponent {
  selectedFile: File | null = null;
  previewData: UserRegistrationData[] = [];
  validUsers: UserRegistrationData[] = [];
  registrationResults: RegistrationResult[] = [];
  isProcessing = false;
  errorMessage = '';

  constructor(
    private usersService: UsersService,
    private router: Router
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      this.selectedFile = file;
      this.clearPreview();
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Please select a valid JSON file.';
      this.selectedFile = null;
    }
  }

  previewUsers(): void {
    if (!this.selectedFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.users && Array.isArray(data.users)) {
          this.previewData = data.users;
          this.validUsers = this.previewData.filter(user => this.isValidUser(user));
          this.errorMessage = '';
        } else {
          this.errorMessage = 'JSON file must contain a "users" array.';
        }
      } catch (error) {
        this.errorMessage = 'Invalid JSON file format.';
        console.error('JSON parsing error:', error);
      }
    };
    reader.readAsText(this.selectedFile);
  }

  isValidUser(user: UserRegistrationData): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    
    return !!(
      user.email && emailRegex.test(user.email) &&
      user.password && passwordRegex.test(user.password) &&
      user.fullName && user.fullName.trim().length > 0 &&
      user.dateOfBirth && !isNaN(new Date(user.dateOfBirth).getTime()) &&
      user.gender && ['male', 'female'].includes(user.gender)
    );
  }

  async registerAllUsers(): Promise<void> {
    if (this.validUsers.length === 0) return;

    this.isProcessing = true;
    this.registrationResults = [];

    for (const user of this.validUsers) {
      try {
        await this.registerSingleUser(user);
      } catch (error) {
        console.error('Registration error for user:', user.email, error);
      }
    }

    this.isProcessing = false;
  }

  private registerSingleUser(user: UserRegistrationData): Promise<void> {
    return new Promise((resolve) => {
      this.usersService.registerUser(
        user.email,
        user.password,
        user.fullName,
        new Date(user.dateOfBirth),
        user.gender,
        null, // No image file for bulk registration
        user.role || 10
      ).subscribe({
        next: () => {
          this.registrationResults.push({
            user: user,
            success: true
          });
          resolve();
        },
        error: (error) => {
          let errorMessage = 'Unknown error occurred';
          
          if (error.status === 409) {
            errorMessage = 'User with this email already exists';
          } else if (error.status === 400) {
            errorMessage = 'Invalid user data';
          } else if (error.status === 500) {
            errorMessage = 'Server error';
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }

          this.registrationResults.push({
            user: user,
            success: false,
            error: errorMessage
          });
          resolve();
        }
      });
    });
  }

  clearPreview(): void {
    this.previewData = [];
    this.validUsers = [];
    this.registrationResults = [];
  }

  get successfulResults(): RegistrationResult[] {
    return this.registrationResults.filter(r => r.success);
  }

  get failedResults(): RegistrationResult[] {
    return this.registrationResults.filter(r => !r.success);
  }

  get successCount(): number {
    return this.successfulResults.length;
  }

  get errorCount(): number {
    return this.failedResults.length;
  }
}