import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TabellaStaff } from '../../pattern/tabella-staff/tabella-staff';

@Component({
  selector: 'his-staff',
  imports: [TabellaStaff],
  templateUrl: './staff.html',
  styleUrl: './staff.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Staff {}
