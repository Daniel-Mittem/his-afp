import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GestioneRisorse } from '../../core/Risorse/gestione-risorse';
import { InputText } from 'primeng/inputtext';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'his-accettazione-pz',
  imports: [InputText, ReactiveFormsModule],
  templateUrl: './accettazione-pz.html',
  styleUrl: './accettazione-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccettazionePz {
  gestioneRisorse = inject(GestioneRisorse);
  nome = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(30),
  ]);
}
