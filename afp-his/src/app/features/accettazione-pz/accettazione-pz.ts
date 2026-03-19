import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GestioneRisorse } from '../../core/Risorse/gestione-risorse';
import { InputTextModule } from 'primeng/inputtext';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'his-accettazione-pz',
  imports: [InputTextModule, ReactiveFormsModule, JsonPipe],
  templateUrl: './accettazione-pz.html',
  styleUrl: './accettazione-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccettazionePz {
  GestioneRisorse = inject(GestioneRisorse);
  nome = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]);


}
