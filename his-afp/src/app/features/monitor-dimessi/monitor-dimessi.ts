import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PatientManager } from '../../core/Pazienti/patient-manager';
import { DischargedAdmission } from '../../core/Pazienti/Pazienti.model';

@Component({
  selector: 'his-monitor-dimessi',
  imports: [TableModule, Button, TooltipModule],
  templateUrl: './monitor-dimessi.html',
  styleUrl: './monitor-dimessi.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitorDimessi implements OnInit {
  readonly PatientManager = inject(PatientManager);
  dischargedPatients = signal<DischargedAdmission[]>([]);
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  ngOnInit() {
    this.loadDischargedPatients();
  }

  loadDischargedPatients() {
    this.loading.set(true);
    this.errorMessage.set('');

    this.PatientManager.fetchDischargedPatients().subscribe({
      next: (res) => {
        this.dischargedPatients.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Errore nel caricamento dei pazienti dimessi:', err);
        this.errorMessage.set('Errore nel caricamento dei dati. Riprovare.');
        this.loading.set(false);
      },
    });
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('it-IT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}
