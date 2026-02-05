import { Component,signal, input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { Button } from "primeng/button";

export interface Paziente {
  id: string;
  nome: string;
  cognome: string;
  braccialetto: string;
  eta: number;
  codiceColore: string;
  note: string;
  patologia: string;
}

@Component({
  selector: 'his-card-pz',
  imports: [CardModule, Button],
  templateUrl: './card-pz.html',
  styleUrl: './card-pz.scss',
})
export class CardPZ {
  paziente = input.required<Paziente>();
}
