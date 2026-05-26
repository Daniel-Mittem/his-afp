import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StaffManager } from '../../core/Staff/staff-manager';
import { CardStaff } from '../../ui/card-staff/card-staff';
import { Button } from 'primeng/button';

@Component({
  selector: 'his-tabella-staff',
  imports: [CardStaff, Button],
  templateUrl: './tabella-staff.html',
  styleUrl: './tabella-staff.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabellaStaff {
  readonly staffManager = inject(StaffManager);
}
