import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StatoAPI } from "../../ui/statoAPI/statoAPI";

@Component({
  selector: 'his-stato-servizi',
  imports: [StatoAPI],
  templateUrl: './stato-servizi.html',
  styleUrl: './stato-servizi.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatoServizi {

}
