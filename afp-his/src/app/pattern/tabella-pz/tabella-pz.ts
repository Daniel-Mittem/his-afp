import { ChangeDetectionStrategy, Component, effect, inject, model } from '@angular/core';
import { PazienteManager } from '../../core/Pazienti/patient-manager';
import { CardPZ } from "../../ui/card-pz/card-pz";
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Button } from "primeng/button";
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'his-tabella-pz',
  imports: [FormsModule, InputText, CardPZ, Button, ToggleSwitchModule],
  templateUrl: './tabella-pz.html',
  styleUrl: './tabella-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabellaPz {
  nomePaziente = model<string>('');
  readonly PazienteManager = inject(PazienteManager);
  enableReFresh = model<boolean>(false);

  constructor() {
    effect(() => {
      this.PazienteManager.filterByName(this.nomePaziente());
    });

    if (this.enableReFresh()) {
      this.PazienteManager.refreshPazienti();
    } else {
      this.PazienteManager.stopRefreshPazienti();
    }   
  }
}
