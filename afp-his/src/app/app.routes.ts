import { Routes } from '@angular/router';
import { ListaPz } from './features/lista-pz/lista-pz';
import { ModificaPz } from './features/modifica-pz/modifica-pz';
import { AccettazionePz } from './features/accettazione-pz/accettazione-pz';
import { StatoPz } from './features/stato-servizi/stato-pz';

export const routes: Routes = [
    {
        path: 'lista-pz',
        component: ListaPz,
    },
    {
        path: 'modifica-pz:id',
        component: ModificaPz
    },
    {
        path: 'modifica-pz',
        component: ModificaPz
    },
    {
        path: 'accettazione-pz',
        component: AccettazionePz
    },
    {
        path: 'stato-pz',
        component: StatoPz
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
