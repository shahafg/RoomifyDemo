export class AuditoriumBooking {
  private _id: number;
  private _auditoriumId: number;
  private _userId: number;
  private _startTime: string;
  private _endTime: string;
  private _bookingDate: Date;
  private _purpose: string;
  private _status: AuditoriumBookingStatus;
  private _attendeeCount: number;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    id: number,
    auditoriumId: number,
    userId: number,
    startTime: string,
    endTime: string,
    bookingDate: Date,
    purpose: string,
    attendeeCount: number,
    status: AuditoriumBookingStatus = AuditoriumBookingStatus.Confirmed,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this._id = id;
    this._auditoriumId = auditoriumId;
    this._userId = userId;
    this._startTime = startTime;
    this._endTime = endTime;
    this._bookingDate = bookingDate;
    this._purpose = purpose;
    this._attendeeCount = attendeeCount;
    this._status = status;
    this._createdAt = createdAt || new Date();
    this._updatedAt = updatedAt || new Date();
  }

  // Getters
  get id(): number {
    return this._id;
  }

  get auditoriumId(): number {
    return this._auditoriumId;
  }

  get userId(): number {
    return this._userId;
  }

  get startTime(): string {
    return this._startTime;
  }

  get endTime(): string {
    return this._endTime;
  }

  get bookingDate(): Date {
    return this._bookingDate;
  }

  get purpose(): string {
    return this._purpose;
  }

  get status(): AuditoriumBookingStatus {
    return this._status;
  }

  get attendeeCount(): number {
    return this._attendeeCount;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Setters
  set id(value: number) {
    this._id = value;
  }

  set auditoriumId(value: number) {
    this._auditoriumId = value;
  }

  set userId(value: number) {
    this._userId = value;
  }

  set startTime(value: string) {
    this._startTime = value;
  }

  set endTime(value: string) {
    this._endTime = value;
  }

  set bookingDate(value: Date) {
    this._bookingDate = value;
  }

  set purpose(value: string) {
    this._purpose = value;
  }

  set status(value: AuditoriumBookingStatus) {
    this._status = value;
  }

  set attendeeCount(value: number) {
    this._attendeeCount = value;
  }

  set updatedAt(value: Date) {
    this._updatedAt = value;
  }

  // Helper methods
  get formattedDate(): string {
    return this._bookingDate.toLocaleDateString();
  }

  get timeSlot(): string {
    return `${this._startTime} - ${this._endTime}`;
  }

  get statusDisplay(): string {
    switch (this._status) {
      case AuditoriumBookingStatus.Pending:
        return 'Pending';
      case AuditoriumBookingStatus.Confirmed:
        return 'Confirmed';
      case AuditoriumBookingStatus.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  canBeCancelled(): boolean {
    return this._status === AuditoriumBookingStatus.Confirmed || 
           this._status === AuditoriumBookingStatus.Pending;
  }

  isUpcoming(): boolean {
    const now = new Date();
    const bookingDateTime = new Date(this._bookingDate);
    const [hours, minutes] = this._startTime.split(':').map(Number);
    bookingDateTime.setHours(hours, minutes);
    
    return bookingDateTime > now && this._status !== AuditoriumBookingStatus.Cancelled;
  }
}

export enum AuditoriumBookingStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Cancelled = 'cancelled'
}