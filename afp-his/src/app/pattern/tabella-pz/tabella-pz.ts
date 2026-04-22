import { ChangeDetectionStrategy, Component, effect, inject, input, model } from '@angular/core';
import { PazienteManager } from '../../core/Pazienti/patient-manager';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TableModule } from 'primeng/table';
import { Button } from "primeng/button";
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'his-tabella-pz',
  imports: [FormsModule, ToggleSwitchModule, TableModule, Button, RouterLink],
  templateUrl: './tabella-pz.html',
  styleUrl: './tabella-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabellaPz {
  nomePaziente = model<string>('');
  readonly PazienteManager = inject(PazienteManager);
  enableReFresh = model<boolean>(false);
  readonly #router = inject(Router);

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

  public navigateToSchedaPaziente(pzid: number) {
    this.#router.navigate([`/modifica-pz/${pzid}`]);
  }
  

}