import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Ticket, TicketCategory } from '../models/ticket';
import { TicketService } from '../services/tickets.service';
import { User } from '../models/user';

@Component({
  selector: 'app-create-ticket',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-ticket.component.html',
  styleUrl: './create-ticket.component.css'
})
export class CreateTicketComponent{
  ticketForm: FormGroup;
  userTickets: Ticket[] = [];
  showTicketList: boolean = true;
  showTicketDetail: boolean = false;
  showCreateForm: boolean = false;
  selectedTicket: Ticket | null = null;
  
  // For file attachments
  attachments: File[] = [];
  
  // Category options
  categoryOptions = [
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing Question' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'account', label: 'Account Issue' },
    { value: 'other', label: 'Other' }
  ];
  
  // Mock current user - in a real app, this would come from an auth service
  currentUser : User;

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService
  ) {
    // Initialize the form
    this.ticketForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['technical', Validators.required]
    });
     // Mock user - in a real application, get this from auth service
     this.currentUser = new User(
      1,
      'user@example.com',
      'password',
      'Regular User',
      new Date(1990, 1, 1),
      'male'
    );
    // Load user's tickets
    this.loadUserTickets();
    
  }

  
  loadUserTickets(): void {
    this.ticketService.getTicketsByUser(this.currentUser).subscribe(
      tickets => {
        console.log('Received tickets:', tickets);
        this.userTickets = tickets;
      },
      error => {
        console.error('Error loading tickets:', error);
      }
    );
  }

  // Show ticket creation form
  showCreateTicket(): void {
    this.showTicketList = false;
    this.showTicketDetail = false;
    this.showCreateForm = true;
    this.resetForm();
  }
  
  // Cancel ticket creation
  cancelTicketCreation(): void {
    if (this.ticketForm.dirty && confirm('Are you sure you want to discard this ticket?')) {
      this.showTicketList = true;
      this.showCreateForm = false;
      this.resetForm();
    } else if (!this.ticketForm.dirty) {
      this.showTicketList = true;
      this.showCreateForm = false;
    }
  }

  // Submit ticket form
  onSubmit(): void {
    if (this.ticketForm.invalid) {
      return;
    }

    // Create ticket object
    const newTicket = new Ticket(
      this.ticketForm.value.title,
      this.ticketForm.value.description,
      this.ticketForm.value.category as TicketCategory,
      this.currentUser,
      undefined,
      'medium', // Default priority (admin will change it)
      'new',    // Default status
      undefined,
      this.attachments.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))
    );

    // Save ticket via service
    this.ticketService.createTicket(newTicket).subscribe(
      createdTicket => {
        // Update local tickets list
        this.loadUserTickets();
        
        // Show success message
        alert('Ticket created successfully!');
        
        // Reset form and return to ticket list
        this.resetForm();
        this.showTicketList = true;
        this.showCreateForm = false;
      }
    );
  }

  // View ticket details
  viewTicket(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.showTicketList = false;
    this.showTicketDetail = true;
    this.showCreateForm = false;
  }

  // Back to ticket list
  backToList(): void {
    this.selectedTicket = null;
    this.showTicketList = true;
    this.showTicketDetail = false;
    this.showCreateForm = false;
  }

  // Handle file selection for attachments
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files) {
      const files = Array.from(input.files);
      const remainingSlots = 5 - this.attachments.length;

      if (files.length > remainingSlots) {
        alert(`You can only attach up to 5 files. Adding the first ${remainingSlots} files.`);
        files.splice(remainingSlots);
      }

      this.attachments = [...this.attachments, ...files];

      // Reset the input to allow selecting the same file again
      input.value = '';
    }
  }

  // Remove attachment
  removeAttachment(index: number): void {
    this.attachments.splice(index, 1);
  }

  // Helper functions for file handling
  isTextFile(filename: string): boolean {
    return /\.(txt|doc|docx|rtf|odt)$/i.test(filename);
  }

  isImageFile(filename: string): boolean {
    return /\.(jpg|jpeg|png|gif|bmp|svg)$/i.test(filename);
  }

  isPdfFile(filename: string): boolean {
    return /\.pdf$/i.test(filename);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get CSS class for status badge
  getStatusClass(status: string): string {
    switch (status) {
      case 'new': return 'bg-primary';
      case 'in-progress': return 'bg-info';
      case 'resolved': return 'bg-success';
      case 'closed': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  // Format date for display
  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  // Reset form and related data
  resetForm(): void {
    this.ticketForm.reset({
      category: 'technical'
    });
    this.attachments = [];
  }
  getAttachments(): Array<{name: string, size: number, type: string}> | undefined {
    return this.attachments;
  }
}