import { Role } from '../models/role';

export class User {
  email: string;
  password: string;
  fullName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female';
  image: string | null;
  role: Role;

  constructor(email: string, password: string, fullName: string, dateOfBirth: Date, gender: 'male' | 'female', image?: string, role: Role = 0) {
    this.email = email;
    this.password = password;
    this.fullName = fullName;
    this.dateOfBirth = dateOfBirth;
    this.gender = gender;
    this.image = image ?? (gender === 'male' ? 'assets/images/profile/male.jpg' : 'assets/images/profile/female.jpg');
    this.role = role;
  }
}