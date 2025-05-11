import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any; // Declare bootstrap to use its JS API

interface Recipient {
  id: number;
  name: string;
  email?: string;
  type: 'user' | 'group';
  memberCount?: number;
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})

export class MessagesComponent {
  messageForm: FormGroup;
  
  @ViewChild('recipientsModal') modalElement!: ElementRef;
  private bootstrapModal: any;
  
  // Arrays for recipients
  users: Recipient[] = [];
  groups: Recipient[] = [];
  filteredUsers: Recipient[] = [];
  filteredGroups: Recipient[] = [];
  selectedRecipients: Recipient[] = [];
  tempSelectedRecipients: Recipient[] = []; // For modal selection

  // For file attachments
  attachments: File[] = [];
  
  // For search
  searchTerm: string = '';

  constructor(private fb: FormBuilder) {
    this.messageForm = this.fb.group({
      destination: ['', Validators.required],
      subject: ['', Validators.required],
      messageContent: ['', Validators.required]
    });

    // Populate users and groups with mock data
    this.loadMockData();
    this.filteredUsers = [...this.users];
    this.filteredGroups = [...this.groups];
  }

  ngAfterViewInit(): void {
    // Initialize Bootstrap modal after view is initialized
    if (this.modalElement) {
      this.bootstrapModal = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }

  loadMockData(): void {
    // Mock users
    this.users = [
      { id: 1, name: 'John Doe', email: 'john.doe@example.com', type: 'user' },
      { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', type: 'user' },
      { id: 3, name: 'Robert Johnson', email: 'robert.johnson@example.com', type: 'user' },
      { id: 4, name: 'Emily Davis', email: 'emily.davis@example.com', type: 'user' },
      { id: 5, name: 'Michael Brown', email: 'michael.brown@example.com', type: 'user' },
      { id: 6, name: 'Sarah Miller', email: 'sarah.miller@example.com', type: 'user' },
      { id: 7, name: 'David Wilson', email: 'david.wilson@example.com', type: 'user' },
      { id: 8, name: 'Jessica Taylor', email: 'jessica.taylor@example.com', type: 'user' }
    ];

    // Mock groups
    this.groups = [
      { id: 101, name: 'Marketing Team', memberCount: 8, type: 'group' },
      { id: 102, name: 'Development Team', memberCount: 12, type: 'group' },
      { id: 103, name: 'HR Department', memberCount: 5, type: 'group' },
      { id: 104, name: 'Sales Team', memberCount: 10, type: 'group' },
      { id: 105, name: 'Executive Board', memberCount: 6, type: 'group' }
    ];
  }

  // Open recipients modal
  openRecipientsModal(): void {
    this.tempSelectedRecipients = [...this.selectedRecipients];
    this.searchTerm = '';
    this.filteredUsers = [...this.users];
    this.filteredGroups = [...this.groups];
    
    // Show Bootstrap modal
    if (this.bootstrapModal) {
      this.bootstrapModal.show();
    } else {
      // If the modal instance isn't available yet, create it
      this.bootstrapModal = new bootstrap.Modal(document.getElementById('recipientsModal'));
      this.bootstrapModal.show();
    }
  }

  // Filter users and groups based on search term
  filterUsers(): void {
    const term = this.searchTerm.toLowerCase();
    
    this.filteredUsers = this.users.filter(user => 
      user.name.toLowerCase().includes(term) || 
      (user.email && user.email.toLowerCase().includes(term))
    );
    
    this.filteredGroups = this.groups.filter(group => 
      group.name.toLowerCase().includes(term)
    );
  }

  // Check if a recipient is selected
  isSelected(recipient: Recipient): boolean {
    return this.tempSelectedRecipients.some(r => r.id === recipient.id && r.type === recipient.type);
  }

  // Toggle selection for individual users
  toggleRecipientSelection(recipient: Recipient): void {
    const index = this.tempSelectedRecipients.findIndex(
      r => r.id === recipient.id && r.type === recipient.type
    );
    
    if (index === -1) {
      this.tempSelectedRecipients.push(recipient);
    } else {
      this.tempSelectedRecipients.splice(index, 1);
    }
  }

  // Toggle selection for groups
  toggleGroupSelection(group: Recipient): void {
    this.toggleRecipientSelection(group);
  }

  // Confirm and apply recipient selection
  confirmRecipientSelection(): void {
    this.selectedRecipients = [...this.tempSelectedRecipients];
    
    // Update the destination field based on selected recipients
    if (this.selectedRecipients.length === 1) {
      this.messageForm.patchValue({
        destination: this.selectedRecipients[0].name
      });
    } else if (this.selectedRecipients.length > 1) {
      this.messageForm.patchValue({
        destination: `${this.selectedRecipients.length} recipients`
      });
    } else {
      this.messageForm.patchValue({
        destination: ''
      });
    }
    
    this.hideModal();
  }

  // Hide the modal
  hideModal(): void {
    if (this.bootstrapModal) {
      this.bootstrapModal.hide();
    }
  }

  // Remove a recipient from the selected list
  removeRecipient(index: number): void {
    this.selectedRecipients.splice(index, 1);
    
    // Update the destination field
    if (this.selectedRecipients.length === 1) {
      this.messageForm.patchValue({
        destination: this.selectedRecipients[0].name
      });
    } else if (this.selectedRecipients.length > 1) {
      this.messageForm.patchValue({
        destination: `${this.selectedRecipients.length} recipients`
      });
    } else {
      this.messageForm.patchValue({
        destination: ''
      });
    }
  }

  // Handle file selection
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

  // Remove an attachment
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

  // Form submission handler
  onSubmit(): void {
    if (this.messageForm.invalid) {
      return;
    }
    
    // Create message object
    const message = {
      recipients: this.selectedRecipients,
      subject: this.messageForm.value.subject,
      content: this.messageForm.value.messageContent,
      attachments: this.attachments.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))
    };
    
    console.log('Message to be sent:', message);
    
    // Here you would typically call a service to send the message
    // For demo, just show a success alert
    alert('Message sent successfully!');
    
    // Reset the form and attachments
    this.resetForm();
  }

  discardMessage(): void {
    if (confirm('Are you sure you want to discard this message?')) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.messageForm.reset();
    this.selectedRecipients = [];
    this.attachments = [];
  }
}