import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaintenanceService, MaintenancePeriod } from '../services/maintenance.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-maintenance-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './maintenance-management.component.html',
  styleUrls: ['./maintenance-management.component.css']
})

export class MaintenanceManagementComponent implements OnInit {
  maintenancePeriods: MaintenancePeriod[] = [];
  maintenanceForm: FormGroup;
  isEditing = false;
  editingId: number | null = null;
  todayDateTime: string;

  constructor(
    private maintenanceService: MaintenanceService,
    private fb: FormBuilder
  ) {
    // Set minimum datetime to current time
    const now = new Date();
    this.todayDateTime = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM

    this.maintenanceForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      startDate: [this.todayDateTime, [Validators.required]],
      endDate: ['', [Validators.required]]
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit(): void {
    this.loadMaintenancePeriods();
  }

  // Custom validator to ensure end date is after start date
  dateRangeValidator = (form: FormGroup) => {
    const startDate = form.get('startDate')?.value;
    const endDate = form.get('endDate')?.value;
    
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return { dateRangeInvalid: true };
    }
    return null;
  };

  loadMaintenancePeriods(): void {
    this.maintenanceService.getAllMaintenancePeriods().subscribe({
      next: (periods) => {
        this.maintenancePeriods = periods;
      },
      error: (error) => {
        console.error('Error loading maintenance periods:', error);
        alert('Failed to load maintenance periods.');
      }
    });
  }

  onSubmit(): void {
    if (this.maintenanceForm.invalid) {
      this.maintenanceForm.markAllAsTouched();
      return;
    }

    const formValue = this.maintenanceForm.value;
    const maintenanceData: MaintenancePeriod = {
      title: formValue.title,
      description: formValue.description,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      isActive: true,
      createdBy: 'Current Admin' // In production, get from auth service
    };

    if (this.isEditing && this.editingId) {
      this.updateMaintenancePeriod(this.editingId, maintenanceData);
    } else {
      this.createMaintenancePeriod(maintenanceData);
    }
  }

  createMaintenancePeriod(maintenance: MaintenancePeriod): void {
    this.maintenanceService.createMaintenancePeriod(maintenance).subscribe({
      next: (response) => {
        alert('Maintenance period created successfully!');
        this.resetForm();
        this.loadMaintenancePeriods();
      },
      error: (error) => {
        console.error('Error creating maintenance period:', error);
        alert('Failed to create maintenance period: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }

  updateMaintenancePeriod(id: number, maintenance: MaintenancePeriod): void {
    this.maintenanceService.updateMaintenancePeriod(id, maintenance).subscribe({
      next: (response) => {
        alert('Maintenance period updated successfully!');
        this.resetForm();
        this.loadMaintenancePeriods();
      },
      error: (error) => {
        console.error('Error updating maintenance period:', error);
        alert('Failed to update maintenance period: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }

  editMaintenancePeriod(period: MaintenancePeriod): void {
    this.isEditing = true;
    this.editingId = period.id!;
    
    // Format dates for datetime-local input
    const startDate = new Date(period.startDate).toISOString().slice(0, 16);
    const endDate = new Date(period.endDate).toISOString().slice(0, 16);
    
    this.maintenanceForm.patchValue({
      title: period.title,
      description: period.description,
      startDate: startDate,
      endDate: endDate
    });
  }

  deactivateMaintenancePeriod(id: number): void {
    if (confirm('Are you sure you want to deactivate this maintenance period?')) {
      this.maintenanceService.deactivateMaintenancePeriod(id).subscribe({
        next: () => {
          alert('Maintenance period deactivated successfully!');
          this.loadMaintenancePeriods();
        },
        error: (error) => {
          console.error('Error deactivating maintenance period:', error);
          alert('Failed to deactivate maintenance period.');
        }
      });
    }
  }

  deleteMaintenancePeriod(id: number): void {
    if (confirm('Are you sure you want to permanently delete this maintenance period? This action cannot be undone.')) {
      this.maintenanceService.deleteMaintenancePeriod(id).subscribe({
        next: () => {
          alert('Maintenance period deleted successfully!');
          this.loadMaintenancePeriods();
        },
        error: (error) => {
          console.error('Error deleting maintenance period:', error);
          alert('Failed to delete maintenance period.');
        }
      });
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.editingId = null;
    this.maintenanceForm.reset({
      title: '',
      description: '',
      startDate: this.todayDateTime,
      endDate: ''
    });
  }

  formatDateTime(dateTime: string | Date | undefined): string {
    if (!dateTime) {
      return 'N/A';
    }
    
    // If it's already a Date object, use it directly
    if (dateTime instanceof Date) {
      return dateTime.toLocaleString();
    }
    
    // If it's a string, convert to Date first
    return new Date(dateTime).toLocaleString();
  }

  isMaintenanceActive(period: MaintenancePeriod): boolean {
    const now = new Date();
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);
    
    return period.isActive && now >= startDate && now <= endDate;
  }

  isMaintenanceUpcoming(period: MaintenancePeriod): boolean {
    const now = new Date();
    const startDate = new Date(period.startDate);
    
    return period.isActive && now < startDate;
  }

  isMaintenanceCompleted(period: MaintenancePeriod): boolean {
    const now = new Date();
    const endDate = new Date(period.endDate);
    
    return now > endDate;
  }
}