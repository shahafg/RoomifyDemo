import { User } from '../models/user';

export type TicketStatus = 'new' | 'in-progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketCategory = 'technical' | 'billing' | 'feature' | 'account' | 'other';

export class Ticket {
  private id?: number;
  private title: string;
  private description: string;
  private category: TicketCategory;
  private priority: TicketPriority;
  private status: TicketStatus;
  private createdBy: User;
  private assignedTo?: User;
  private createdAt: Date;
  private updatedAt?: Date;
  private attachments: Array<{name: string, size: number, type: string}>;

  constructor(
    title: string,
    description: string,
    category: TicketCategory,
    createdBy: User,
    id?: number,
    priority: TicketPriority = 'medium',
    status: TicketStatus = 'new',
    assignedTo?: User,
    attachments: Array<{name: string, size: number, type: string}> = []
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.category = category;
    this.priority = priority;
    this.status = status;
    this.createdBy = createdBy;
    this.assignedTo = assignedTo;
    this.createdAt = new Date();
    this.attachments = attachments;
  }

  // Getters
  getId(): number | undefined {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string {
    return this.description;
  }

  getCategory(): TicketCategory {
    return this.category;
  }

  getPriority(): TicketPriority {
    return this.priority;
  }

  getStatus(): TicketStatus {
    return this.status;
  }

  getCreatedBy(): User {
    return this.createdBy;
  }

  getAssignedTo(): User | undefined {
    return this.assignedTo;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  getAttachments(): Array<{name: string, size: number, type: string}> {
    return this.attachments;
  }

  // Setters
  setId(id: number): void {
    this.id = id;
  }

  setTitle(title: string): void {
    this.title = title;
  }

  setDescription(description: string): void {
    this.description = description;
  }

  setCategory(category: TicketCategory): void {
    this.category = category;
  }

  setPriority(priority: TicketPriority): void {
    this.priority = priority;
    this.updatedAt = new Date();
  }

  setStatus(status: TicketStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  setAssignedTo(user: User): void {
    this.assignedTo = user;
    this.updatedAt = new Date();
  }

  addAttachment(attachment: {name: string, size: number, type: string}): void {
    this.attachments.push(attachment);
    this.updatedAt = new Date();
  }

  removeAttachment(index: number): void {
    if (index >= 0 && index < this.attachments.length) {
      this.attachments.splice(index, 1);
      this.updatedAt = new Date();
    }
  }
}