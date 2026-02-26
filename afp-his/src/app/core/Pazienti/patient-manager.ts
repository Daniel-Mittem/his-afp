import { inject, Injectable, signal } from '@angular/core';
import { Paziente, PazienteDTO } from './Pazienti.model';
import { APIResponse } from '../../../../../his-afp/src/app/core/models/APIResponse.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})

export class PazienteManager {
  #http = inject(HttpClient);
  #ListaPz = signal<Paziente[]>([]);
  #listaPzFiltered = signal<Paziente[]>(this.#ListaPz());
  ListaPz = this.#listaPzFiltered.asReadonly();

  constructor() {
    this.fetchPazienti();
  }

  public fetchPazienti() {
    this.#http.get<APIResponse<PazienteDTO[]>>('http://localhost:3000/admissions').subscribe({
      next: (res) => {
        const pz = res.data.map(p => this.mapPazienteDTOToPaziente(p));
        this.#ListaPz.set(pz);
      },
      error: (err) => {
        console.error('Error fetching pazienti:', err);
      }
    });
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
