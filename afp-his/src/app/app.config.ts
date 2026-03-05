import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    providePrimeNG({
      theme: {
      preset: Aura, // Tema di default fornito da PrimeNG. Potete modificarlo
      options: {
      ripple: true, // Animazione grafica
      darkModeSelector: '.my-app-dark', // Abilitazione tema scuro
        },
      },
    }),
  ]
};
