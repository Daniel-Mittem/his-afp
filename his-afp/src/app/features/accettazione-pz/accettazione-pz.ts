import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {GestioneRisorse} from '../../core/Risorse/gestione-risorse';
import {InputText} from 'primeng/inputtext';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {JsonPipe} from '@angular/common';
import {Button} from 'primeng/button';

@Component({
  selector: 'his-accettazione-pz',
  imports: [InputText, ReactiveFormsModule, JsonPipe, Button],
  templateUrl: './accettazione-pz.html',
  styleUrl: './accettazione-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccettazionePz {
  gestioneRisorse = inject(GestioneRisorse);

  paziente = new FormGroup({
    nome: new FormControl('', [Validators.required]),
    cognome: new FormControl('', [Validators.required]),
  });

  checkFormControl(control: string) {
    const fc = this.paziente.get(control);
    // nome.invalid && (nome.touched || nome.dirty)
    return fc?.invalid && (fc.touched || fc.dirty);
  }

  checkFormControlError(control: string, err: string) {
    const fc = this.paziente.get(control);

    if (fc && fc.hasError(err)) {
      return fc.getError(err);
    } else {
      return null;
    }
  }

  onSubmit() {
    if (this.paziente.valid) {
      console.log(this.paziente.value);
    } else {
      this.paziente.markAllAsTouched();
    }
  }
}
