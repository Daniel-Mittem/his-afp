import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { PazienteManager } from './core/Pazienti/patient-manager';

import { routes } from './app.routes';
import { GestioneRisorse } from './core/Risorse/gestione-risorse';

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
    provideAppInitializer(() => inject(PazienteManager).fetchPazienti()), 
    provideAppInitializer(() => inject(GestioneRisorse).fetchRisorse()),
  ]
};
