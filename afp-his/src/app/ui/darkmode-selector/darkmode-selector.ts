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
  private readonly THEME_KEY = 'user-theme-preference'
  
  isDark = signal<boolean>(this.loadInitialTheme());

  constructor() {
    effect(() => {
      const darkModeActive = this.isDark();
      const htmlElement = document.documentElement;

      if (darkModeActive) {
        htmlElement.classList.add('my-app-dark');
      } else {
        htmlElement.classList.remove('my-app-dark');
      }

      localStorage.setItem(this.THEME_KEY, JSON.stringify(darkModeActive));
    });
  }

  private loadInitialTheme(): boolean {
    const savedTheme = localStorage.getItem(this.THEME_KEY);

    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggleDarkMode() {
    this.isDark.update((current) => !current);
  }
}