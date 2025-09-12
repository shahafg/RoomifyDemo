import { Role } from '../models/role';

export class User {
  private id: number;
  private email: string;
  private password: string;
  private fullName: string;
  private dateOfBirth: Date;
  private gender: 'male' | 'female';
  private image: string | null;
  private role: Role;

  constructor(id: number, email: string, password: string, fullName: string, dateOfBirth: Date, gender: 'male' | 'female', image?: string, role: Role = 10) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.fullName = fullName;
    this.dateOfBirth = dateOfBirth;
    this.gender = gender;
    this.image = image ?? (gender === 'male' ? 'assets/images/profile/male.jpg' : 'assets/images/profile/female.jpg');
    this.role = role;
  }

  getId(): number {
    return this.id;
  }
  getEmail(): string {
    return this.email;
  }
  getPassword(): string {
    return this.password;
  }
  getFullName(): string {
    return this.fullName;
  }
  getDateOfBirth(): Date {
    return this.dateOfBirth;
  }
  getGender(): 'male' | 'female' {
    return this.gender;
  }
  getImage(): string | null {
    return this.image;
  }
  getRole(): Role {
    return this.role;
  }

  setId(id: number): void {
    this.id = id;
  }
  setEmail(email: string): void {
    this.email = email;
  }
  setPassword(password: string): void {
    this.password = password;
  }
  setFullName(fullName: string): void {
    this.fullName = fullName;
  }
  setDateOfBirth(dateOfBirth: Date): void {
    this.dateOfBirth = dateOfBirth;
  }
  setGender(gender: 'male' | 'female'): void {
    this.gender = gender;
  }
  setImage(image: string | null): void {
    this.image = image;
  }
  setRole(role: Role): void {
    this.role = role;
  }
}