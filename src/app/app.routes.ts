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

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'view-rooms', component: ViewRoomsComponent },
    { path: 'room-search', component: RoomSearchComponent },
    { path: 'rooms', component: RoomManagementComponent },
    { path: 'register-users', component: RegisterUsersComponent },
    { path: 'auditorium-schedule', component: AuditoriumScheduleComponent },
    { path: 'time-schedule', component: TimeScheduleComponent },
    { path: 'classroom-exchange', component: ClassroomExchangeComponent },
    { path: 'create-ticket', component: CreateTicketComponent },
    { path: 'tickets', component: TicketsComponent },
    { path: 'create-ticket', component: CreateTicketComponent },
    { path: 'messages', component: MessagesComponent },
    { path: 'about', component: AboutComponent },
    { path: 'profile', children: [
        { path: '', redirectTo: 'login', pathMatch: 'full' }, 
        { path: 'login', component: LoginComponent },
        { path: 'register', component: RegisterComponent },
        { path: 'user-details', component: UserDetailsComponent }
    ]},
    { path: '**', component: MissingPageComponent } 
];
