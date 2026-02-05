import { Component, signal } from '@angular/core';
import { CardPZ, Paziente } from "../card-pz/card-pz";

@Component({
  selector: 'his-lista-pz',
  imports: [CardPZ],
  templateUrl: './lista-pz.html',
  styleUrl: './lista-pz.scss',
})
export class ListaPz {
  listaPz = signal<Paziente[]>([
    {
    id: '123',
    nome: 'Pietro',
    cognome: 'Marconi',
    braccialetto: 'A12345',
    eta: 32,
    codiceColore: 'ROSSO',
    note: 'Trauma',
      patologia: 'C19'
    },
    {
    id: '123',
    nome: 'Abdul',
    cognome: 'Zafarth',
    braccialetto: 'A22446',
    eta: 69,
    codiceColore: 'NERO',
    note: 'Mezza faccia esplosa',
      patologia: 'C4'
    },
  ]);
}
