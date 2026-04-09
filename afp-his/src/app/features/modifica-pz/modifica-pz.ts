import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, effect, inject, input, untracked } from '@angular/core';
import { PatientAdmission, PazienteDTO } from '../../core/Pazienti/Pazienti.model';
import { APIResponse } from '../../core/models/APIResponse.model';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { FieldsetModule } from 'primeng/fieldset';
import { TextareaModule } from 'primeng/textarea';
import { GestioneRisorse } from '../../core/Risorse/gestione-risorse';
import { formatDate } from '@angular/common';
import { PazienteManager } from '../../core/Pazienti/patient-manager';


@Component({
  selector: 'his-modifica-pz',
  imports: [InputTextModule, ReactiveFormsModule, Button, MessageModule, DatePickerModule, SelectModule, FieldsetModule, TextareaModule],
  templateUrl: './modifica-pz.html',
  styleUrl: './modifica-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModificaPz {
  patientID = input<string>();
  patientInfo = input.required<APIResponse<PazienteDTO>>();
  readonly #fb = inject(FormBuilder);
  gestioneRisorse = inject(GestioneRisorse);
  patientManager = inject(PazienteManager);

  readonly maxDate = new Date();
  readonly sexOption = [{
    code: 'M',
    desc: 'Maschio'
  },
  {
    code: 'F',
    desc: 'Femmina',
  }]

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
    }),
    residenza: this.#fb.group({
      via: ['', [Validators.required]],
      civico: ['', [Validators.required, Validators.min(0)]],
      comune: ['', [Validators.required]],
      provincia: ['', [Validators.required]],
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
        console.log(this.paziente.value);
        this.patientManager.updatePatientInfo(Number(this.patientID()) || -1, this.paziente.value.residenza as Pick<PatientAdmission, 'residenza'>);
      } else {
        this.paziente.markAllAsTouched();
      }
    }
  

  constructor() {
    effect(() => {
      const pzVal = this.patientInfo();
      if (this.patientID() === undefined) {
        console.log('No patient ID provided');
      }
      
      const data = this.patientInfo().data;
      if (data) {
        untracked(() => {
          if (pzVal?.data) {
            this.paziente.patchValue({
              anagrafica: {
                nome: data.nome,
                cognome: data.cognome,
                dataNascita: formatDate(data.dataNascita, 'dd/MM/yyyy', 'en'),
                codiceFiscale: data.codiceFiscale,
                sesso: data.sex,},
              sanitaria: {
                patologia: data.patologiaCode,
                modArrivo: data.modalitaArrivoCode,
                noteTriage: data.noteTriage,
                codiceColore: data.coloreCode,
              },
              residenza: {
                via: data.indirizzoVia,
                civico: data.indirizzoCivico,
                comune: data.comune,
                provincia: data.provincia,
              },
            });
            this.paziente.get('anagrafica')?.disable();
            this.paziente.get('sanitaria')?.disable();
          }
        });
      }
    });
  }
}
