import { Component, computed, inject, model, signal } from '@angular/core';
import { CardPZ, Paziente } from "../card-pz/card-pz";
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Button } from "primeng/button";
import { TagModule } from 'primeng/tag';
import { HealthStatus } from '../core/SystemStatus/healthStatus.model';
import { StatoAPI } from "../ui/statoAPI/statoAPI";
import { SystemStatus } from '../core/SystemStatus/system-status';


interface Response{
  status: string;
  data:HealthStatus;
}

@Component({
  selector: 'his-lista-pz',
  imports: [CardPZ, InputTextModule, FormsModule, Button, TagModule, StatoAPI],
  templateUrl: './lista-pz.html',
  styleUrl: './lista-pz.scss',
})
export class ListaPz {
  nomePaziente = model<string>('');


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
    {
      id: '123',
      nome: 'Abdul',
      cognome: 'Zafarth',
      braccialetto: 'A22446',
      eta: 69,
      codiceColore: 'AZZURRO',
      note: 'Mezza faccia esplosa',
      patologia: 'C4'
    },
    {
      id: '123',
      nome: 'Abdul',
      cognome: 'Zafarth',
      braccialetto: 'A22446',
      eta: 69,
      codiceColore: 'BIANCO',
      note: 'Mezza faccia esplosa',
      patologia: 'C4'
    },
  ]);

  filteredList = computed(() => {
    return this.listaPz().filter((pz) =>
      pz.nome.toLowerCase().includes(this.nomePaziente().toLowerCase()),);
  });
  
  editNomePaziente(nomePZ: string) {
    this.nomePaziente.set(nomePZ);
  }
}
