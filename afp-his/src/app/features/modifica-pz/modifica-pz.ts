import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { PazienteDTO } from '../../core/Pazienti/Pazienti.model';
import { APIResponse } from '../../core/models/APIResponse.model';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'his-modifica-pz',
  imports: [JsonPipe],
  templateUrl: './modifica-pz.html',
  styleUrl: './modifica-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModificaPz {
  patientID = input<string>();

  patient = httpResource<APIResponse<PazienteDTO>>(() => `http://localhost:3000/admissions/${this.patientID()}`, {});

  constructor() {
    effect(() => {
      if (this.patientID() === undefined) {
        console.log('No patient ID provided');
      }
    });
  }
}
