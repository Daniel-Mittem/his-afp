import { Component, computed, inject, model, signal } from '@angular/core';
import { CardPZ } from "../card-pz/card-pz";
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Button } from "primeng/button";
import { TagModule } from 'primeng/tag';
import { HealthStatus } from '../core/SystemStatus/healthStatus.model';
import { StatoAPI } from "../ui/statoAPI/statoAPI";
import { Paziente } from '../core/Pazienti/Pazienti.model';
import { PazienteManager } from '../core/Pazienti/patient-manager';


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
  readonly PazienteManager = inject(PazienteManager);
  listaPz = this.PazienteManager.ListaPz;

  filteredList = computed(() => {
    return this.listaPz().filter((pz) =>
      pz.nome.toLowerCase().includes(this.nomePaziente().toLowerCase()),);
  });
  
  editNomePaziente(nomePZ: string) {
    this.nomePaziente.set(nomePZ);
  }
}
