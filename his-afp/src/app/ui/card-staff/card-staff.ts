import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { Card } from "primeng/card";
import { Staff } from '../../core/Staff/staff.model';
import { Button } from 'primeng/button';
import { StaffManager } from '../../core/Staff/staff-manager';

@Component({
  selector: 'his-card-staff',
  imports: [Card, Button],
  templateUrl: './card-staff.html',
  styleUrl: './card-staff.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardStaff {
  staff = input.required<Staff>();
  readonly #staffManager = inject(StaffManager);

  setColoreStato() {
    return this.staff().isActive ? 'text-green-400' : 'text-red-400';
  }

  toggleStaffStatus() {
    this.#staffManager.toggleStaffStatus(this.staff().id, this.staff().isActive);
  }
}
