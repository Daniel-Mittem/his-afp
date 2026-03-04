import { ChangeDetectionStrategy, Component, effect, inject, model } from '@angular/core';
import { PazienteManager } from '../../core/Pazienti/patient-manager';
import { CardPZ } from "../../ui/card-pz/card-pz";
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'his-tabella-pz',
  imports: [FormsModule, InputText, CardPZ],
  templateUrl: './tabella-pz.html',
  styleUrl: './tabella-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabellaPz {
   nomePaziente = model<string>('');
   readonly PazienteManager = inject(PazienteManager);

  constructor() {
    effect(() => {
      this.PazienteManager.filterByName(this.nomePaziente());
    });
  }
}
