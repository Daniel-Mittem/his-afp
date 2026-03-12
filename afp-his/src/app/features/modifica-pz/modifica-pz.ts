import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';

@Component({
  selector: 'his-modifica-pz',
  imports: [],
  templateUrl: './modifica-pz.html',
  styleUrl: './modifica-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModificaPz {
  patientID = input<string>();

  constructor() {
    effect(() => {
      if (this.patientID() === undefined) {
        console.log('No patient ID provided');
      }
    });
  }
}
