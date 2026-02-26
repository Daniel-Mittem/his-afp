import { Component, computed, inject, model, signal } from '@angular/core';
import { CardPz, Paziente } from '../card-pz/card-pz';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SystemStatus } from '../core/SystemStatus/system-status';
import { StatoAPI } from '../ui/stato-api/stato-api';

interface Response<T> {
  status: string;
  data: T;
}

@Component({
  selector: 'his-lista-pz',
  imports: [InputTextModule, FormsModule, ButtonModule, CardPz, TagModule, StatoAPI],
  templateUrl: './lista-pz.html',
  styleUrl: './lista-pz.scss',
})
export class ListaPz {
  nomePaziente = model<string>('');
  listaPz = signal<Paziente[]>([
    {
      braccialetto: 'PR234',
      codiceColore: 'VERDE',
      cognome: 'Rocchio',
      eta: 25,
      id: '23',
      nome: 'Pietro',
      note: 'TRauma',
      patologia: 'C19',
    },
    {
      braccialetto: 'BR0034',
      codiceColore: 'ARANCIONE',
      cognome: 'Brazorf',
      eta: 25,
      id: '1',
      nome: 'Ajeje',
      note: 'TRauma',
      patologia: 'C19',
    },
    {
      braccialetto: 'LSD',
      codiceColore: 'ROSSO',
      cognome: 'Winky',
      eta: 25,
      id: '1',
      nome: 'Tinky',
      note: 'TRauma',
      patologia: 'C19',
    },
    {
      braccialetto: 'LSD',
      codiceColore: 'AZZURRO',
      cognome: 'Winky',
      eta: 25,
      id: '1',
      nome: 'Tinky',
      note: 'TRauma',
      patologia: 'C19',
    },
    {
      braccialetto: 'LSD',
      codiceColore: 'AZZURRO',
      cognome: 'Winky',
      eta: 25,
      id: '1',
      nome: 'Tinky',
      note: 'TRauma',
      patologia: 'C19',
    },
  ]);

  healthStatus = inject(SystemStatus).statoAPI;

  filteredList = computed(() => {
    return this.listaPz().filter((pz: Paziente) =>
      pz.nome.toLowerCase().includes(this.nomePaziente().toLowerCase()),
    );
  });

  editNomePaziente(nomePZ: string) {
    this.nomePaziente.set(nomePZ);
  }
}
