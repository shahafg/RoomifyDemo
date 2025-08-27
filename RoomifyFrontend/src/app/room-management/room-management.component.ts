import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Room } from '../models/room';
import { Building } from '../models/building';
import { RoomType } from '../models/room-type';
import { User } from '../models/user';
import { Role } from '../models/role';
import { RoomsService } from '../services/rooms.service';
import { BuildingsService } from '../services/buildings.service';
import { BookingsService, Booking } from '../services/bookings.service';
import { UsersService } from '../services/users.service';

interface Statistics {
  totalRooms: number;
  totalBuildings: number;
  totalBookings: number;
  totalUsers: number;
  availableRooms: number;
  todayBookings: number;
  weekBookings: number;
  roomUtilization: number;
  mostBookedRoom: string;
  leastBookedRoom: string;
}

@Component({
  selector: 'app-room-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './room-management.component.html',
  styleUrl: './room-management.component.css'
})
export class RoomManagementComponent implements OnInit {
  // Tab control
  activeTab: 'overview' | 'rooms' | 'buildings' | 'bookings' | 'users' = 'overview';
  
  // Statistics
  statistics: Statistics = {
    totalRooms: 0,
    totalBuildings: 0,
    totalBookings: 0,
    totalUsers: 0,
    availableRooms: 0,
    todayBookings: 0,
    weekBookings: 0,
    roomUtilization: 0,
    mostBookedRoom: 'N/A',
    leastBookedRoom: 'N/A'
  };

  // Data arrays
  rooms: Room[] = [];
  buildings: Building[] = [];
  bookings: Booking[] = [];
  users: User[] = [];
  filteredBookings: Booking[] = [];
  filteredUsers: User[] = [];

  // Forms
  roomForm: FormGroup;
  buildingForm: FormGroup;
  bookingFilterForm: FormGroup;
  userFilterForm: FormGroup;

  // Edit modes
  editingRoom: Room | null = null;
  editingBuilding: Building | null = null;
  showRoomForm = false;
  showBuildingForm = false;

  // Room type options
  roomTypeOptions = [
    { value: 'Class', label: 'Class' },
    { value: 'ComputerClass', label: 'Computer Class' },
    { value: 'Lab', label: 'Laboratory' },
    { value: 'Auditorium', label: 'Auditorium' }
  ];

  constructor(
    private fb: FormBuilder,
    private roomsService: RoomsService,
    private buildingsService: BuildingsService,
    private bookingsService: BookingsService,
    private usersService: UsersService
  ) {
    // Initialize room form
    this.roomForm = this.fb.group({
      id: [null, Validators.required],
      name: ['', Validators.required],
      type: ['Class', Validators.required],
      building: ['', Validators.required],
      floor: [1, [Validators.required, Validators.min(0)]],
      capacity: [20, [Validators.required, Validators.min(1)]],
      status: [0, Validators.required],
      accessible: [false]
    });

    // Initialize building form
    this.buildingForm = this.fb.group({
      id: [null, Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.required],
      floors: [1, [Validators.required, Validators.min(1)]]
    });

    // Initialize booking filter form
    this.bookingFilterForm = this.fb.group({
      dateFrom: [this.getDateString(new Date())],
      dateTo: [''],
      roomId: [''],
      status: ['']
    });

    // Initialize user filter form
    this.userFilterForm = this.fb.group({
      searchTerm: [''],
      role: ['']
    });
  }

  ngOnInit(): void {
    console.log('RoomManagementComponent initialized');
    this.loadAllData();
    
    // Subscribe to filter changes
    this.bookingFilterForm.valueChanges.subscribe(() => {
      this.filterBookings();
    });

    this.userFilterForm.valueChanges.subscribe(() => {
      this.filterUsers();
    });
  }

  // Load all data
  loadAllData(): void {
    console.log('Loading all data...');
    this.loadBuildings();
    this.loadRooms();
    this.loadBookings();
    this.loadUsers();
  }

  // Load buildings
  loadBuildings(): void {
    console.log('Loading buildings...');
    this.buildingsService.getAllBuildings().subscribe({
      next: (buildings: any[]) => {
        console.log('Buildings received:', buildings);
        this.buildings = buildings.map(b => new Building(
          b.id,
          b.name,
          b.description,
          b.floors
        ));
        console.log('Buildings processed:', this.buildings.length);
        this.updateStatistics();
      },
      error: (error) => {
        console.error('Error loading buildings:', error);
        // Set empty array to prevent infinite loading
        this.buildings = [];
        alert('Failed to load buildings. You can still manage rooms manually.');
      }
    });
  }

  // Load rooms
  loadRooms(): void {
    console.log('Loading rooms...');
    this.roomsService.getAllRooms().subscribe({
      next: (rooms: any[]) => {
        console.log('Rooms received:', rooms);
        this.rooms = rooms.map(r => new Room(
          r.id,
          r.name,
          this.convertStringToRoomType(r.type),
          r.building,
          r.floor,
          r.capacity,
          r.status,
          r.accessible
        ));
        console.log('Rooms processed:', this.rooms.length);
        this.updateStatistics();
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        this.rooms = [];
        alert('Failed to load rooms');
      }
    });
  }

  // Load bookings
  loadBookings(): void {
    console.log('Loading bookings...');
    this.bookingsService.getAllBookings().subscribe({
      next: (bookings: Booking[]) => {
        console.log('Bookings received:', bookings);
        this.bookings = bookings;
        this.filteredBookings = [...bookings];
        this.updateStatistics();
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.bookings = [];
        alert('Failed to load bookings');
      }
    });
  }

  // Load users
  loadUsers(): void {
    console.log('Loading users...');
    this.usersService.getAllUsers().subscribe({
      next: (users: any[]) => {
        console.log('Users received:', users);
        this.users = users.map(u => new User(
          u.email,
          u.password,
          u.fullName,
          new Date(u.dateOfBirth),
          u.gender,
          u.image,
          u.role
        ));
        this.filteredUsers = [...this.users];
        this.updateStatistics();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.users = [];
        alert('Failed to load users');
      }
    });
  }

  // Update statistics
  updateStatistics(): void {
  this.statistics.totalRooms = this.rooms.length;
  this.statistics.totalBuildings = this.buildings.length;
  this.statistics.totalUsers = this.users.length;
  this.statistics.totalBookings = this.bookings.filter(b => b.status === 'active').length;
  this.statistics.availableRooms = this.rooms.filter(r => r.getStatus() === 0).length;

  // Today's bookings
 const today = this.getDateString(new Date());
this.statistics.todayBookings = this.bookings.filter(b => {
  if (b.status !== 'active') return false;
  
  // Extract just the date part from the ISO string
  const bookingDateOnly = b.bookingDate.split('T')[0];
  
  return bookingDateOnly === today;
}).length;

  // This week's bookings
  const now = new Date();
now.setHours(0, 0, 0, 0); // Start of today
const weekFromNow = new Date();
weekFromNow.setDate(weekFromNow.getDate() + 7);
weekFromNow.setHours(23, 59, 59, 999); // End of the day one week from now

this.statistics.weekBookings = this.bookings.filter(b => {
  if (b.status !== 'active') return false;
  
  // Parse the ISO date string properly
  const bookingDate = new Date(b.bookingDate.split('T')[0] + 'T00:00:00.000Z');
  return bookingDate >= now && bookingDate <= weekFromNow;
}).length;

  // Room utilization (percentage of rooms currently booked)
  if (this.rooms.length > 0) {
    this.statistics.roomUtilization = Math.round(
      ((this.rooms.length - this.statistics.availableRooms) / this.rooms.length) * 100
    );
  }

  // Most booked room and Least booked room
  if (this.bookings.length > 0 && this.rooms.length > 0) {
    // Create a map of all rooms with their booking counts (initialize with 0)
    const roomBookingCounts: { [key: string]: number } = {};
    
    // Initialize all rooms with 0 bookings
    this.rooms.forEach(room => {
      roomBookingCounts[room.getName()] = 0;
    });
    
    // Count actual bookings
    this.bookings.forEach(b => {
      if (b.status === 'active') {
        roomBookingCounts[b.roomName] = (roomBookingCounts[b.roomName] || 0) + 1;
      }
    });
    
    const sortedRooms = Object.entries(roomBookingCounts)
      .sort((a, b) => b[1] - a[1]); // Sort by booking count (descending)
    
    // Most booked room (highest count)
    const mostBooked = sortedRooms[0];
    if (mostBooked) {
      this.statistics.mostBookedRoom = `${mostBooked[0]} (${mostBooked[1]} bookings)`;
    }
    
    // Least booked room(s) (lowest count)
    const minBookings = Math.min(...Object.values(roomBookingCounts));
    const leastBookedRooms = Object.entries(roomBookingCounts)
      .filter(([roomName, count]) => count === minBookings)
      .map(([roomName, count]) => roomName);
    
    if (leastBookedRooms.length === 1) {
      // Only one room with minimum bookings
      this.statistics.leastBookedRoom = `${leastBookedRooms[0]} (${minBookings} bookings)`;
    } else if (leastBookedRooms.length === this.rooms.length) {
      // All rooms have the same number of bookings
      this.statistics.leastBookedRoom = `All rooms (${minBookings} bookings each)`;
    } else {
      // Multiple rooms tied for least bookings
      const roomList = leastBookedRooms.slice(0, 3).join(', '); // Show up to 3 rooms
      const remaining = leastBookedRooms.length - 3;
      
      if (remaining > 0) {
        this.statistics.leastBookedRoom = `${roomList} and ${remaining} more (${minBookings} bookings each)`;
      } else {
        this.statistics.leastBookedRoom = `${roomList} (${minBookings} bookings each)`;
      }
    }
  } else if (this.rooms.length > 0) {
    // No bookings but rooms exist
    if (this.rooms.length === 1) {
      this.statistics.leastBookedRoom = `${this.rooms[0].getName()} (0 bookings)`;
    } else {
      this.statistics.leastBookedRoom = `All rooms (0 bookings each)`;
    }
  }
}

  // Filter bookings
  filterBookings(): void {
    const filters = this.bookingFilterForm.value;
    
    this.filteredBookings = this.bookings.filter(booking => {
      if (filters.status && booking.status !== filters.status) return false;
      if (filters.roomId && booking.roomId !== parseInt(filters.roomId)) return false;
      
      if (filters.dateFrom) {
        const bookingDate = new Date(booking.bookingDate);
        const fromDate = new Date(filters.dateFrom);
        if (bookingDate < fromDate) return false;
      }
      
      if (filters.dateTo) {
        const bookingDate = new Date(booking.bookingDate);
        const toDate = new Date(filters.dateTo);
        if (bookingDate > toDate) return false;
      }
      
      return true;
    });
  }

  // Filter users
  filterUsers(): void {
    const filters = this.userFilterForm.value;
    
    this.filteredUsers = this.users.filter(user => {
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        if (!user.getFullName().toLowerCase().includes(searchLower) &&
            !user.getEmail().toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      if (filters.role && user.getRole() !== parseInt(filters.role)) {
        return false;
      }
      
      return true;
    });
  }

  // ROOM MANAGEMENT
  showAddRoomForm(): void {
    console.log('showAddRoomForm called, buildings count:', this.buildings.length);
    
    this.editingRoom = null;
    let defaultBuilding = '';
    
    // Set default building based on what's available
    if (this.buildings.length > 0) {
      defaultBuilding = this.buildings[0].getName();
    } else {
      defaultBuilding = 'D'; // Default fallback option
    }
    
    this.roomForm.reset({
      id: this.getNextRoomId(),
      name: '',
      type: 'Class',
      building: defaultBuilding,
      floor: 1,
      capacity: 20,
      status: 0,
      accessible: false
    });
    this.showRoomForm = true;
    console.log('Room form should now be visible');
  }

  editRoom(room: Room): void {
    this.editingRoom = room;
    this.roomForm.patchValue({
      id: room.getId(),
      name: room.getName(),
      type: this.convertRoomTypeToString(room.getType()),
      building: room.getBuilding(),
      floor: room.getFloor(),
      capacity: room.getCapacity(),
      status: room.getStatus(),
      accessible: room.isAccessible()
    });
    this.showRoomForm = true;
  }

  saveRoom(): void {
    if (this.roomForm.invalid) {
      // Show specific validation errors
      const errors: string[] = [];
      const controls = this.roomForm.controls;
      
      if (controls['id'].errors) errors.push('ID is required');
      if (controls['name'].errors) errors.push('Name is required');
      if (controls['type'].errors) errors.push('Type is required');
      if (controls['building'].errors) errors.push('Building is required');
      if (controls['floor'].errors) errors.push('Valid floor number is required');
      if (controls['capacity'].errors) errors.push('Valid capacity is required');
      
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    const roomData = this.roomForm.value;
    
    if (this.editingRoom) {
      // Update existing room
      this.roomsService.updateRoom(roomData.id, roomData).subscribe({
        next: (updatedRoom) => {
          const index = this.rooms.findIndex(r => r.getId() === this.editingRoom!.getId());
          if (index !== -1) {
            this.rooms[index] = new Room(
              roomData.id,
              roomData.name,
              this.convertStringToRoomType(roomData.type),
              roomData.building,
              roomData.floor,
              roomData.capacity,
              roomData.status,
              roomData.accessible
            );
          }
          alert('Room updated successfully');
          this.showRoomForm = false;
          this.updateStatistics();
        },
        error: (error) => {
          console.error('Error updating room:', error);
          alert('Failed to update room. Please try again.');
        }
      });
    } else {
      // Add new room
      this.roomsService.createRoom(roomData).subscribe({
        next: (savedRoom) => {
          const newRoom = new Room(
            roomData.id,
            roomData.name,
            this.convertStringToRoomType(roomData.type),
            roomData.building,
            roomData.floor,
            roomData.capacity,
            roomData.status,
            roomData.accessible
          );
          this.rooms.push(newRoom);
          alert('Room added successfully');
          this.showRoomForm = false;
          this.updateStatistics();
        },
        error: (error) => {
          console.error('Error adding room:', error);
          if (error.status === 409) {
            alert('A room with this ID already exists. Please use a different ID.');
          } else {
            alert('Failed to add room. Please try again.');
          }
        }
      });
    }
  }

  deleteRoom(room: Room): void {
    if (confirm(`Are you sure you want to delete room ${room.getName()}?`)) {
      // Check if room has active bookings
      const hasActiveBookings = this.bookings.some(b => 
        b.roomId === room.getId() && b.status === 'active'
      );
      
      if (hasActiveBookings) {
        alert('Cannot delete room with active bookings. Please cancel the bookings first.');
        return;
      }
      
      // Call API to delete
      this.roomsService.deleteRoom(room.getId()).subscribe({
        next: () => {
          const index = this.rooms.findIndex(r => r.getId() === room.getId());
          if (index !== -1) {
            this.rooms.splice(index, 1);
            this.updateStatistics();
            alert('Room deleted successfully');
          }
        },
        error: (error) => {
          console.error('Error deleting room:', error);
          alert('Failed to delete room. Please try again.');
        }
      });
    }
  }

  // BUILDING MANAGEMENT
  showAddBuildingForm(): void {
    this.editingBuilding = null;
    this.buildingForm.reset({
      id: this.getNextBuildingId(),
      name: '',
      description: '',
      floors: 1
    });
    this.showBuildingForm = true;
  }

  editBuilding(building: Building): void {
    this.editingBuilding = building;
    this.buildingForm.patchValue({
      id: building.getId(),
      name: building.getName(),
      description: building.getDescription(),
      floors: building.getFloors()
    });
    this.showBuildingForm = true;
  }

  saveBuilding(): void {
    if (this.buildingForm.invalid) {
      alert('Please fill all required fields');
      return;
    }

    const buildingData = this.buildingForm.value;
    
    if (this.editingBuilding) {
      // Update existing building
      this.buildingsService.updateBuilding(buildingData.id, buildingData).subscribe({
        next: (updatedBuilding) => {
          const index = this.buildings.findIndex(b => b.getId() === this.editingBuilding!.getId());
          if (index !== -1) {
            this.buildings[index] = new Building(
              buildingData.id,
              buildingData.name,
              buildingData.description,
              buildingData.floors
            );
          }
          alert('Building updated successfully');
          this.showBuildingForm = false;
          this.updateStatistics();
        },
        error: (error) => {
          console.error('Error updating building:', error);
          alert('Failed to update building. Please try again.');
        }
      });
    } else {
      // Add new building
      this.buildingsService.createBuilding(buildingData).subscribe({
        next: (savedBuilding) => {
          const newBuilding = new Building(
            buildingData.id,
            buildingData.name,
            buildingData.description,
            buildingData.floors
          );
          this.buildings.push(newBuilding);
          alert('Building added successfully');
          this.showBuildingForm = false;
          this.updateStatistics();
        },
        error: (error) => {
          console.error('Error adding building:', error);
          if (error.status === 409) {
            alert('A building with this ID already exists. Please use a different ID.');
          } else {
            alert('Failed to add building. Please try again.');
          }
        }
      });
    }
  }

  deleteBuilding(building: Building): void {
    if (confirm(`Are you sure you want to delete building ${building.getName()}?`)) {
      // Check if building has rooms
      const hasRooms = this.rooms.some(r => r.getBuilding() === building.getName());
      
      if (hasRooms) {
        alert('Cannot delete building with rooms. Please relocate or delete the rooms first.');
        return;
      }
      
      // Call API to delete
      this.buildingsService.deleteBuilding(building.getId()).subscribe({
        next: () => {
          const index = this.buildings.findIndex(b => b.getId() === building.getId());
          if (index !== -1) {
            this.buildings.splice(index, 1);
            this.updateStatistics();
            alert('Building deleted successfully');
          }
        },
        error: (error) => {
          console.error('Error deleting building:', error);
          alert('Failed to delete building. Please try again.');
        }
      });
    }
  }

  // BOOKING MANAGEMENT
  cancelBooking(booking: Booking): void {
    if (confirm(`Are you sure you want to cancel this booking?\nRoom: ${booking.roomName}\nDate: ${booking.bookingDate}\nPurpose: ${booking.purpose}`)) {
      this.bookingsService.cancelBooking(booking.id!).subscribe({
        next: () => {
          booking.status = 'cancelled';
          this.updateStatistics();
          alert('Booking cancelled successfully');
        },
        error: (error) => {
          console.error('Error cancelling booking:', error);
          alert('Failed to cancel booking');
        }
      });
    }
  }

  // USER MANAGEMENT
  getUserRoleLabel(role: Role): string {
    switch(role) {
      case Role.admin: return 'Admin';
      case Role.teacher: return 'Teacher';
      case Role.student: return 'Student';
      case Role.representative: return 'Representative';
      case Role.maintenancePerson: return 'Maintenance';
      case Role.notLoggedIn: return 'Not Logged In';
      default: return 'Unknown';
    }
  }

  isUserMale(user: User): boolean {
    return user.getGender() === 'male';
  }

  isUserFemale(user: User): boolean {
    return user.getGender() === 'female';
  }

  isUserAdmin(user: User): boolean {
    return user.getRole() === Role.admin;
  }

  isUserTeacher(user: User): boolean {
    return user.getRole() === Role.teacher;
  }

  isUserStudent(user: User): boolean {
    return user.getRole() === Role.student;
  }

  isUserRepresentative(user: User): boolean {
    return user.getRole() === Role.representative;
  }

  isUserMaintenance(user: User): boolean {
    return user.getRole() === Role.maintenancePerson;
  }

  isUserNotLoggedIn(user: User): boolean {
    return user.getRole() === Role.notLoggedIn;
  }

  promoteUser(user: User): void {
    const currentRole = user.getRole();
    let newRole: Role;
    
    // Promotion hierarchy: student -> representative -> teacher -> admin
    switch(currentRole) {
      case Role.student:
        newRole = Role.representative;
        break;
      case Role.representative:
        newRole = Role.teacher;
        break;
      case Role.teacher:
        newRole = Role.admin;
        break;
      case Role.maintenancePerson:
        newRole = Role.admin;
        break;
      default:
        alert('User already has the highest role');
        return;
    }
    
    if (confirm(`Promote ${user.getFullName()} to ${this.getUserRoleLabel(newRole)}?`)) {
      user.setRole(newRole);
      alert(`${user.getFullName()} has been promoted to ${this.getUserRoleLabel(newRole)}`);
      // TODO: Implement backend update
    }
  }

  demoteUser(user: User): void {
    const currentRole = user.getRole();
    let newRole: Role;
    
    // Demotion hierarchy: admin -> teacher -> representative -> student
    switch(currentRole) {
      case Role.admin:
        newRole = Role.teacher;
        break;
      case Role.teacher:
        newRole = Role.representative;
        break;
      case Role.representative:
        newRole = Role.student;
        break;
      case Role.maintenancePerson:
        newRole = Role.student;
        break;
      default:
        alert('User already has the lowest role');
        return;
    }
    
    if (confirm(`Demote ${user.getFullName()} to ${this.getUserRoleLabel(newRole)}?`)) {
      user.setRole(newRole);
      alert(`${user.getFullName()} has been demoted to ${this.getUserRoleLabel(newRole)}`);
      // TODO: Implement backend update
    }
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user ${user.getFullName()}?`)) {
      alert('User deletion functionality to be implemented with backend API');
      // TODO: Implement usersService.deleteUser() method
      this.loadUsers();
    }
  }

  // Debug and testing methods
  addSampleBuildings(): void {
    const sampleBuildings = [
      { id: 1, name: 'Main Building', description: 'Main academic building', floors: 3 },
      { id: 2, name: 'Science Building', description: 'Laboratory building', floors: 4 },
      { id: 3, name: 'Engineering Building', description: 'Engineering departments', floors: 5 }
    ];

    this.buildings = sampleBuildings.map(b => new Building(b.id, b.name, b.description, b.floors));
    console.log('Sample buildings added:', this.buildings.length);
    this.updateStatistics();
  }

  // Check if a building exists
  hasBuilding(buildingName: string): boolean {
    return this.buildings.some(b => b.getName() === buildingName);
  }

  // Utility functions
  getNextRoomId(): number {
    return this.rooms.length > 0 ? Math.max(...this.rooms.map(r => r.getId())) + 1 : 1;
  }

  getNextBuildingId(): number {
    return this.buildings.length > 0 ? Math.max(...this.buildings.map(b => b.getId())) + 1 : 1;
  }

  getRoomCountForBuilding(buildingName: string): number {
    return this.rooms.filter(r => r.getBuilding() === buildingName).length;
  }

  convertStringToRoomType(typeString: string): RoomType {
    const typeMap: { [key: string]: RoomType } = {
      'Class': RoomType.Class,
      'ComputerClass': RoomType.ComputerClass,
      'Lab': RoomType.Lab,
      'Auditorium': RoomType.Auditorium
    };
    return typeMap[typeString] ?? RoomType.Class;
  }

  convertRoomTypeToString(typeEnum: RoomType): string {
    const typeMap: { [key: number]: string } = {
      [RoomType.Class]: 'Class',
      [RoomType.ComputerClass]: 'ComputerClass',
      [RoomType.Lab]: 'Lab',
      [RoomType.Auditorium]: 'Auditorium'
    };
    return typeMap[typeEnum] ?? 'Class';
  }

  getRoomTypeDisplay(room: Room): string {
    const typeMap: { [key: number]: string } = {
      [RoomType.Class]: 'Class',
      [RoomType.ComputerClass]: 'Computer Class',
      [RoomType.Lab]: 'Laboratory',
      [RoomType.Auditorium]: 'Auditorium'
    };
    return typeMap[room.getType()] ?? 'Unknown';
  }

  hasNoFilteredUsers(): boolean {
    return this.filteredUsers.length === 0;
  }

  hasNoFilteredBookings(): boolean {
    return this.filteredBookings.length === 0;
  }

  hasNoBookings(): boolean {
    return this.bookings.length === 0;
  }

  getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatDateTime(date: string, time: string): string {
    return `${date} ${time}`;
  }
}