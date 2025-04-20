import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Ticket, TicketStatus, TicketPriority } from '../models/ticket';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  // Mock data storage
  private tickets: Ticket[] = [];
  private ticketsSubject = new BehaviorSubject<Ticket[]>([]);
  private lastId = 0;

  constructor() {
    // Initialize with some mock data if needed
  }

  // Get all tickets as an observable
  getTickets(): Observable<Ticket[]> {
    return this.ticketsSubject.asObservable();
  }

  // Get a specific ticket by ID
  getTicketByEmail(email: string): Observable<Ticket | undefined> {
    const ticket = this.tickets.find(t => t.getCreatedBy().getEmail() === email);
    return of(ticket);
  }

  // Create a new ticket
  createTicket(ticket: Ticket): Observable<Ticket> {
    // Assign an ID to the ticket
    const id = ++this.lastId;
    ticket.setId(id);
    
    // Add to the tickets array
    this.tickets.unshift(ticket);
    this.ticketsSubject.next([...this.tickets]);
    
    return of(ticket);
  }

  // Update ticket status
  updateTicketStatus(id: number, status: TicketStatus): Observable<Ticket | undefined> {
    const ticketIndex = this.tickets.findIndex(t => t.getId() === id);
    
    if (ticketIndex !== -1) {
      this.tickets[ticketIndex].setStatus(status);
      this.ticketsSubject.next([...this.tickets]);
      return of(this.tickets[ticketIndex]);
    }
    
    return of(undefined);
  }

  // Update ticket priority
  updateTicketPriority(id: number, priority: TicketPriority): Observable<Ticket | undefined> {
    const ticketIndex = this.tickets.findIndex(t => t.getId() === id);
    
    if (ticketIndex !== -1) {
      this.tickets[ticketIndex].setPriority(priority);
      this.ticketsSubject.next([...this.tickets]);
      return of(this.tickets[ticketIndex]);
    }
    
    return of(undefined);
  }

  // Assign ticket to user
  assignTicket(id: number, user: User): Observable<Ticket | undefined> {
    const ticketIndex = this.tickets.findIndex(t => t.getId() === id);
    
    if (ticketIndex !== -1) {
      this.tickets[ticketIndex].setAssignedTo(user);
      this.ticketsSubject.next([...this.tickets]);
      return of(this.tickets[ticketIndex]);
    }
    
    return of(undefined);
  }

  // Get tickets filtered by status
  getTicketsByStatus(status: TicketStatus | 'all'): Observable<Ticket[]> {
    if (status === 'all') {
      return of([...this.tickets]);
    }
    
    const filteredTickets = this.tickets.filter(t => t.getStatus() === status);
    return of(filteredTickets);
  }

  // Get tickets created by a specific user
  getTicketsByUser(user: User): Observable<Ticket[]> {
    const filteredTickets = this.tickets.filter(t => t.getCreatedBy().getEmail() === user.getEmail());
    return of(filteredTickets);
  }

  // Get tickets assigned to a specific user
  getTicketsAssignedToUser(userId: number): Observable<Ticket[]> {
    const filteredTickets = this.tickets.filter(
      t => t.getAssignedTo() && t.getAssignedTo()?.getEmail() === userId.toString()
    );
    return of(filteredTickets);
  }

  // Search tickets by term
  searchTickets(term: string): Observable<Ticket[]> {
    if (!term.trim()) {
      return of([...this.tickets]);
    }
    
    const searchTerm = term.toLowerCase();
    const filteredTickets = this.tickets.filter(ticket => 
      ticket.getTitle().toLowerCase().includes(searchTerm) || 
      ticket.getDescription().toLowerCase().includes(searchTerm)
    );
    
    return of(filteredTickets);
  }
}