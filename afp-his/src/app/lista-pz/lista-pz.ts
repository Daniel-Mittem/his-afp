import { Component, computed, inject, model, signal } from '@angular/core';
import { CardPZ, Paziente } from "../card-pz/card-pz";
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Button } from "primeng/button";
import { HttpClient } from '@angular/common/http';
import { TagModule } from 'primeng/tag';

interface Response{
  status: string;
  data:HealthStatus;
}

interface HealthStatus {
  service: string;
  database: string;
  uptime: number;
}

@Component({
  selector: 'his-lista-pz',
  imports: [CardPZ, InputTextModule, FormsModule, Button, TagModule],
  templateUrl: './lista-pz.html',
  styleUrl: './lista-pz.scss',
})
export class ListaPz {
  nomePaziente = model<string>('');
  healthStatus = signal<HealthStatus | null>(null);
  


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

  constructor() {
    this.getHealthStatus();
  }

  readonly #http = inject(HttpClient);
  getHealthStatus() {
    this.#http.get<Response>('http://localhost:3000/health').subscribe((res) => {
      console.table(res.data);
      console.log('DB Status:', res.data.database);

      this.healthStatus.set(res.data);
    });
  }
}
