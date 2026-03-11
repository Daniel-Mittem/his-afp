import { Component, effect, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'his-darkmode-selector',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './darkmode-selector.html',
  styleUrl: './darkmode-selector.scss',
})
export class DarkmodeSelector {
  isDark = signal(window.matchMedia('(prefers-color-scheme: dark)').matches);

  constructor() {
    effect(() => {
      const darkModeActive = this.isDark();
      const htmlElement = document.documentElement;

      if (darkModeActive) {
        htmlElement.classList.add('my-app-dark');
      } else {
        htmlElement.classList.remove('my-app-dark');
      }
    });
  }
  
  toggleDarkMode() {
    this.isDark.update((current) => !current);
  }
}