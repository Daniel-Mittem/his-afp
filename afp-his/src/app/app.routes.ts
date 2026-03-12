import { Routes } from '@angular/router';
import { ListaPz } from './features/lista-pz/lista-pz';
import { ModificaPz } from './features/modifica-pz/modifica-pz';
import { AccettazionePz } from './features/accettazione-pz/accettazione-pz';
import { StatoServizi } from './features/stato-servizi/stato-servizi';

export const routes: Routes = [
    {
        path: 'lista-pz',
         loadComponent: () => import('./features/lista-pz/lista-pz').then((m) => m.ListaPz),
    },
    {
        path: 'modifica-pz',
          loadComponent: () => import('./features/modifica-pz/modifica-pz').then((m) => m.ModificaPz),
    },
    {
        path: 'modifica-pz/:patientID',
         loadComponent: () => import('./features/modifica-pz/modifica-pz').then((m) => m.ModificaPz),
    }, 
    {
        path: 'accettazione-pz',
         loadComponent: () => import('./features/accettazione-pz/accettazione-pz').then((m) => m.AccettazionePz),
    },
    {
        path: 'stato-servizi',
         loadComponent: () => import('./features/stato-servizi/stato-servizi').then((m) => m.StatoServizi),
    },
    {
        path: '',
        redirectTo: 'lista-pz',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'lista-pz',
        pathMatch: 'full'
    }
];
