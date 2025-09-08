export class Auditorium {
  private _id: number;
  private _name: string;
  private _buildingId: number;
  private _capacity: number;
  private _features: string[];
  private _isActive: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    id: number,
    name: string,
    buildingId: number,
    capacity: number,
    features: string[] = [],
    isActive: boolean = true,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this._id = id;
    this._name = name;
    this._buildingId = buildingId;
    this._capacity = capacity;
    this._features = features;
    this._isActive = isActive;
    this._createdAt = createdAt || new Date();
    this._updatedAt = updatedAt || new Date();
  }

  // Getters
  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get buildingId(): number {
    return this._buildingId;
  }

  get capacity(): number {
    return this._capacity;
  }

  get features(): string[] {
    return this._features;
  }

  get isActive(): boolean {
    return this._isActive;
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

  set name(value: string) {
    this._name = value;
  }

  set buildingId(value: number) {
    this._buildingId = value;
  }

  set capacity(value: number) {
    this._capacity = value;
  }

  set features(value: string[]) {
    this._features = value;
  }

  set isActive(value: boolean) {
    this._isActive = value;
  }

  set updatedAt(value: Date) {
    this._updatedAt = value;
  }

  // Helper methods
  hasFeature(feature: string): boolean {
    return this._features.includes(feature);
  }

  addFeature(feature: string): void {
    if (!this.hasFeature(feature)) {
      this._features.push(feature);
    }
  }

  removeFeature(feature: string): void {
    this._features = this._features.filter(f => f !== feature);
  }
}