import { Component, inject } from '@angular/core';
import { SystemStatus } from '../../core/SystemStatus/system-status';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'his-stato-api',
  imports: [Tag],
  templateUrl: 'stato-api.html',
  styleUrl: './stato-api.scss',
})
export class StatoAPI {
  healthStatus = inject(SystemStatus).statoAPI;
}
