import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Ticket, TicketStatus, TicketPriority } from '../models/ticket';
import { TicketService } from '../services/tickets.service';
import { User } from '../models/user';
import { Role } from '../models/role';

declare var bootstrap: any; // Declare bootstrap to use its JS API

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.css'
})
export class TicketsComponent implements OnInit {
  ticketList: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  selectedTicket: Ticket | null = null;
  
  // For user assignment
  users: User[] = [];
  filteredUsers: User[] = [];
  
  // Modal handling
  @ViewChild('assigneeModal') modalElement!: ElementRef;
  private bootstrapModal: any;
  
  // For search and filtering
  searchTerm: string = '';
  statusFilter: string = 'all';
  priorityFilter: string = 'all';
  
  // Priority options
  priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];
  
  // Mock current admin user
  currentUser: User;

  constructor(
    private ticketService: TicketService
  ) {
    // Mock admin user
    this.currentUser = new User(
      1,
      'admin@example.com',
      'password',
      'Admin User',
      new Date(1985, 1, 1),
      'female',
      undefined,
      4
    );
  }

  ngOnInit(): void {
    this.loadAllTickets();
    this.loadSupportUsers();
  }
  
  ngAfterViewInit(): void {
    // Initialize Bootstrap modal after view is initialized
    if (document.getElementById('assigneeModal')) {
      this.bootstrapModal = new bootstrap.Modal(document.getElementById('assigneeModal'));
    }
  }
  
  loadAllTickets(): void {
    this.ticketService.getTickets().subscribe(
      tickets => {
        this.ticketList = tickets;
        this.applyFilters();
      }
    );
  }
  
  loadSupportUsers(): void {
    // For now, mock support users
    this.users = [
      new User(1, 'admin@example.com', 'password', 'Admin User', new Date(1985, 1, 1), 'female', undefined, 4),
      new User(2, 'support1@example.com', 'password', 'Support User 1', new Date(1988, 5, 15), 'male', undefined, 0),
      new User(3, 'support2@example.com', 'password', 'Support User 2', new Date(1990, 8, 22), 'female', undefined, 2)
    ];
    
    this.filteredUsers = [...this.users];
  }

  // View ticket details
  viewTicket(ticket: Ticket): void {
    this.selectedTicket = ticket;
  }

  // Back to ticket list
  backToList(): void {
    this.selectedTicket = null;
  }

  // Update ticket status
  updateStatus(ticket: Ticket, newStatus: TicketStatus): void {
    this.ticketService.updateTicketStatus(ticket.getId()!, newStatus).subscribe(
      updatedTicket => {
        if (updatedTicket) {
          // If viewing the ticket, update the selected ticket as well
          if (this.selectedTicket && this.selectedTicket.getId() === ticket.getId()) {
            this.selectedTicket = updatedTicket;
          }
          
          this.loadAllTickets();
          alert(`Ticket status updated to ${newStatus}`);
        }
      }
    );
  }

  // Update ticket priority
  updatePriority(ticket: Ticket, newPriority: TicketPriority): void {
    this.ticketService.updateTicketPriority(ticket.getId()!, newPriority).subscribe(
      updatedTicket => {
        if (updatedTicket) {
          // If viewing the ticket, update the selected ticket as well
          if (this.selectedTicket && this.selectedTicket.getId() === ticket.getId()) {
            this.selectedTicket = updatedTicket;
          }
          
          this.loadAllTickets();
          alert(`Ticket priority updated to ${newPriority}`);
        }
      }
    );
  }

  // Open assignee selection modal
  openAssigneeModal(): void {
    if (!this.selectedTicket) return;
    
    this.searchTerm = '';
    this.filteredUsers = [...this.users];

    // Show Bootstrap modal
    if (this.bootstrapModal) {
      this.bootstrapModal.show();
    } else {
      // If the modal instance isn't available yet, create it
      this.bootstrapModal = new bootstrap.Modal(document.getElementById('assigneeModal'));
      this.bootstrapModal.show();
    }
  }

  // Assign ticket to user
  assignTicket(user: User): void {
    if (!this.selectedTicket) return;
    
    this.ticketService.assignTicket(this.selectedTicket.getId()!, user).subscribe(
      updatedTicket => {
        if (updatedTicket) {
          this.selectedTicket = updatedTicket;
          
          // Hide modal
          if (this.bootstrapModal) {
            this.bootstrapModal.hide();
          }
          
          this.loadAllTickets();
          alert(`Ticket assigned to ${user.getFullName()}`);
        }
      }
    );
  }

  // Filter users based on search term
  filterUsers(): void {
    const term = this.searchTerm.toLowerCase();
    
    this.filteredUsers = this.users.filter(user => 
      user.getFullName().toLowerCase().includes(term) || 
      user.getEmail().toLowerCase().includes(term)
    );
  }

  // Apply filters to ticket list
  applyFilters(): void {
    let filtered = [...this.ticketList];
    
    // Apply search term filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.getTitle().toLowerCase().includes(term) || 
        ticket.getDescription().toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.getStatus() === this.statusFilter as TicketStatus);
    }
    
    // Apply priority filter
    if (this.priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.getPriority() === this.priorityFilter as TicketPriority);
    }
    
    this.filteredTickets = filtered;
  }

  // Check if user is admin or support
  isAdminOrSupport(user: User): boolean {
    // Assuming roles are numbers and admin or support roles are higher numbers
    return user.getRole() >= 15;
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

  // Get CSS class for priority badge
  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'low': return 'bg-success';
      case 'medium': return 'bg-info';
      case 'high': return 'bg-warning';
      case 'critical': return 'bg-danger';
      default: return 'bg-secondary';
    }
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
}