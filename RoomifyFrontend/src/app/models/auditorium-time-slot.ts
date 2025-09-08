export class AuditoriumTimeSlot {
  private _id: number;
  private _startTime: string;
  private _endTime: string;
  private _displayName: string;
  private _isActive: boolean;
  private _order: number;

  constructor(
    id: number,
    startTime: string,
    endTime: string,
    displayName: string,
    isActive: boolean = true,
    order: number = 0
  ) {
    this._id = id;
    this._startTime = startTime;
    this._endTime = endTime;
    this._displayName = displayName;
    this._isActive = isActive;
    this._order = order;
  }

  // Getters
  get id(): number {
    return this._id;
  }

  get startTime(): string {
    return this._startTime;
  }

  get endTime(): string {
    return this._endTime;
  }

  get displayName(): string {
    return this._displayName;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get order(): number {
    return this._order;
  }

  // Setters
  set id(value: number) {
    this._id = value;
  }

  set startTime(value: string) {
    this._startTime = value;
  }

  set endTime(value: string) {
    this._endTime = value;
  }

  set displayName(value: string) {
    this._displayName = value;
  }

  set isActive(value: boolean) {
    this._isActive = value;
  }

  set order(value: number) {
    this._order = value;
  }

  // Helper methods
  get duration(): number {
    const start = this.timeToMinutes(this._startTime);
    const end = this.timeToMinutes(this._endTime);
    return end - start;
  }

  get durationHours(): number {
    return this.duration / 60;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  isCurrentTimeSlot(): boolean {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentTime >= this._startTime && currentTime < this._endTime;
  }

  isPastTimeSlot(): boolean {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentTime > this._endTime;
  }

  isFutureTimeSlot(): boolean {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentTime < this._startTime;
  }
}