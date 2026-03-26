import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GestioneRisorse } from '../../core/Risorse/gestione-risorse';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { Button } from "primeng/button";
import { MessageModule } from 'primeng/message';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { FieldsetModule } from 'primeng/fieldset';
import { TextareaModule } from 'primeng/textarea';
import { PazienteManager } from '../../core/Pazienti/patient-manager';
import { PatientAdmission } from '../../core/Pazienti/Pazienti.model';

@Component({
  selector: 'his-accettazione-pz',
  imports: [InputTextModule, ReactiveFormsModule, JsonPipe, Button, MessageModule, DatePickerModule, SelectModule, FieldsetModule, TextareaModule],
  templateUrl: './accettazione-pz.html',
  styleUrl: './accettazione-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccettazionePz {
  PazienteManager = inject(PazienteManager)
  readonly maxDate = new Date();
  readonly sexOption = [{
    code: 'M',
    desc: 'Maschio'
  },
  {
    code: 'F',
    desc: 'Femmina',
  }]

  gestioneRisorse = inject(GestioneRisorse);

  // paziente = new FormGroup({
  //   nome: new FormControl('', [Validators.required]),
  //   cognome: new FormControl('', [Validators.required]),
  // });

  readonly #fb = inject(FormBuilder);

  paziente = this.#fb.group({
    anagrafica: this.#fb.group({
      nome: ['', [Validators.required]],
      cognome: ['', [Validators.required]],
      dataNascita: ['', [Validators.required]],
      codiceFiscale: ['', [Validators.required, Validators.pattern("[A-Z]{6}\\d{2}[A-Z]\\d{2}[A-Z]\\d{3}[A-Z]")]],
      sesso: ['', Validators.required],
    }),
    sanitaria: this.#fb.group({
      patologia: ['', [Validators.required]],
      codiceColore: ['', [Validators.required]],
      modArrivo: ['', [Validators.required]],
      noteTriage: ['', [Validators.required, Validators.maxLength(500)]],
    })
  })

  checkFormControl(control: string) {
    const fc = this.paziente.get(control);
    return fc?.invalid && (fc.touched || fc.dirty);
  }

  checkFormControlError(control: string, err: string) {
    const fc = this.paziente.get(control);

    if (fc && fc.hasError(err)) {
      return fc.getError(err);
    } else {
      return null
    }
  }

  onSubmit() {
    if(this.paziente.valid){
      this.PazienteManager.admitPatient(this.paziente.value as PatientAdmission);
    } else {
      this.paziente.markAllAsTouched();
    }
  }
}
