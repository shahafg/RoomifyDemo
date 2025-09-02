import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  features = [
    {
      title: 'Smart Scheduling',
      description: 'Automated room allocation and conflict resolution for seamless class scheduling',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      title: 'Resource Management',
      description: 'Track and manage technological equipment, computers, and educational materials',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      title: 'User-Friendly Interface',
      description: 'Intuitive design that makes room management simple for all users',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  ];
}
