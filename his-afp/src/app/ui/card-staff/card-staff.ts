import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Card } from "primeng/card";
import { Staff } from '../../core/Staff/staff.model';

@Component({
  selector: 'his-card-staff',
  imports: [Card],
  templateUrl: './card-staff.html',
  styleUrl: './card-staff.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardStaff {
  staff = input.required<Staff>();

  setColoreStato() {
    return this.staff().isActive
      ? 'text-green-400'
      : 'text-red-400';
  }
}
