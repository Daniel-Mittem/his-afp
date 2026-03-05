import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'his-darkmode-selector',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './darkmode-selector.html',
  styleUrl: './darkmode-selector.scss',
})
export class DarkmodeSelector implements OnInit {
  isDark: boolean = false;

  ngOnInit() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDark = prefersDark;
    
    if (this.isDark) {
      document.querySelector('html')?.classList.add('my-app-dark');
    }
  }

  toggleDarkMode() {
    const element = document.querySelector('html');
    this.isDark = element?.classList.toggle('my-app-dark') ?? false;
  }
}