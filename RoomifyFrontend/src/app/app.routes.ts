// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { MissingPageComponent } from './missing-page/missing-page.component';
import { ViewRoomsComponent } from './view-rooms/view-rooms.component';
import { MessagesComponent } from './messages/messages.component';
import { RoomSearchComponent } from './room-search/room-search.component';
import { RegisterUsersComponent } from './register-users/register-users.component';
import { TimeScheduleComponent } from './time-schedule/time-schedule.component';
import { TicketsComponent } from './tickets/tickets.component';
import { RoomManagementComponent } from './room-management/room-management.component';
import { AuditoriumScheduleComponent } from './auditorium-schedule/auditorium-schedule.component';
import { ClassroomExchangeComponent } from './classroom-exchange/classroom-exchange.component';
import { AboutComponent } from './about/about.component';
import { CreateTicketComponent } from './create-ticket/create-ticket.component';
import { MaintenanceManagementComponent } from './maintenance-management/maintenance-management.component';

// Import the guards
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    
    // Public routes
    { path: 'about', component: AboutComponent },
    
    // Profile routes (public)
    { path: 'profile', children: [
        { path: '', redirectTo: 'login', pathMatch: 'full' }, 
        { path: 'login', component: LoginComponent },
        { path: 'register', component: RegisterComponent },
        { path: 'user-details', component: UserDetailsComponent, canActivate: [AuthGuard] }
    ]},
    
    // Protected routes - require login only
    { path: 'view-rooms', component: ViewRoomsComponent, canActivate: [AuthGuard] },
    { path: 'room-search', component: RoomSearchComponent, canActivate: [AuthGuard] },
    { path: 'auditorium-schedule', component: AuditoriumScheduleComponent, canActivate: [AuthGuard] },
    { path: 'time-schedule', component: TimeScheduleComponent, canActivate: [AuthGuard] },
    { path: 'classroom-exchange', component: ClassroomExchangeComponent, canActivate: [AuthGuard] },
    { path: 'create-ticket', component: CreateTicketComponent, canActivate: [AuthGuard] },
    { path: 'tickets', component: TicketsComponent, canActivate: [AuthGuard] },
    { path: 'messages', component: MessagesComponent, canActivate: [AuthGuard] },
    
    // Admin-only routes - NOTE: Only AdminGuard needed (it checks login internally)
    { path: 'rooms', component: RoomManagementComponent, canActivate: [AdminGuard] },
    { path: 'register-users', component: RegisterUsersComponent, canActivate: [AdminGuard] },
    { path: 'maintenance', component: MaintenanceManagementComponent, canActivate: [AdminGuard] },
    
    // 404 route
    { path: '404', component: MissingPageComponent },
    { path: '**', redirectTo: '/404' }
];