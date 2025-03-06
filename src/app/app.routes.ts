import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { MissingPageComponent } from './missing-page/missing-page.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'profile', children: [
        { path: '', redirectTo: 'login', pathMatch: 'full' }, 
        { path: 'login', component: LoginComponent },
        { path: 'register', component: RegisterComponent },
        { path: 'user-details', component: UserDetailsComponent }
    ]},
    { path: '**', component: MissingPageComponent } 
];
