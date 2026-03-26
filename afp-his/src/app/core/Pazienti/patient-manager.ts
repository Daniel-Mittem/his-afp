import { inject, Injectable, signal } from '@angular/core';
import { PatientAdmission, PatientAdmissionRes, Paziente, PazienteDTO } from './Pazienti.model';
import { APIResponse } from '../models/APIResponse.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})

export class PazienteManager {
  #http = inject(HttpClient);
  readonly #router = inject(Router);
  #ListaPz = signal<Paziente[]>([]);
  #listaPzFiltered = signal<Paziente[]>(this.#ListaPz());
  ListaPz = this.#listaPzFiltered.asReadonly();
  timer_id = signal<number>(-1);

  /** 
  * Creazione timer di t secondi
  */
  public refreshPazienti() { 
    if (this.timer_id() >= 0) return; 
    let timer_id = setInterval(() => this.fetchPazienti(), 1000); 
    this.timer_id.set(timer_id);
  }

  public stopRefreshPazienti() {
    clearInterval(this.timer_id());
    this.timer_id.set(-1);
  }

  public fetchPazienti() {
    this.#http.get<APIResponse<PazienteDTO[]>>(`${environment.apiUrl}/admissions`).subscribe({
      next: (res) => {
        const pz = res.data.map(p => this.mapPazienteDTOToPaziente(p));
        this.#ListaPz.set(pz);
      },
      error: (err) => {
        console.error('Error fetching pazienti:', err);
      }
    });
  }

  public admitPatient(pz: PatientAdmission) {
    this.#http.post<APIResponse<PatientAdmissionRes>>(`${environment.apiUrl}/admissions`, pz)
      .subscribe({
        next: (res) => {
          this.#router.navigate([`/modifica-pz/${res.data.id}`]);
      },
        error: (err) => {
          console.error("Errore durante l'ammissione del pazinete:", err);
      },
    })
  }

  public mapPazienteDTOToPaziente(pz: PazienteDTO): Paziente {
    return {
      id: pz.id.toString(),
      nome: pz.nome,
      cognome: pz.cognome,
      braccialetto: pz.braccialetto,
      codiceColore: pz.coloreCode,
      note: pz.noteTriage,
      patologia: pz.patologiaCode,
      eta: this.calcolaEta(pz.dataNascita),
    };
  }

  public calcolaEta(dataNascita: string): number {
    const oggi = new Date();
    const nascita = new Date(dataNascita);
    let eta = oggi.getFullYear() - nascita.getFullYear();
    const m = oggi.getMonth() - nascita.getMonth();
    if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) {
      eta--;
    }
    return eta;
  }

  public filterByName(name: string) {
    const filtered = this.#ListaPz().filter(p =>
      p.nome.toLowerCase().includes(name.toLowerCase()) ||
      p.cognome.toLowerCase().includes(name.toLowerCase())
    );
    this.#listaPzFiltered.set(filtered);
  }
}
