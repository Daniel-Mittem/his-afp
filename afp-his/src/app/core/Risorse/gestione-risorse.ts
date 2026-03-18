import { inject, Injectable, signal } from '@angular/core';
import { ArrivalMode, Pathology, TriageColor } from './risorse.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { APIResponse } from '../models/APIResponse.model';

@Injectable({
  providedIn: 'root',
})
  
export class GestioneRisorse {
  readonly #http = inject(HttpClient);
  readonly #triageColors = signal<TriageColor[]>([]);
  TriageColor = this.#triageColors.asReadonly();
  readonly #pathologies = signal<Pathology[]>([]);
  Pathology = this.#pathologies.asReadonly();
  readonly #arrivalModes = signal<ArrivalMode[]>([]);
  ArrivalModes = this.#arrivalModes.asReadonly();

  public fetchRisorse() {
    this.fetchTriageColors();
    this.fetchPathology();
    this.fetchArrivalMode();
  }

  private fetchTriageColors() {
    this.#http.get<APIResponse<TriageColor[]>>(`${environment.apiUrl}/resources/triage-colors`)
      .subscribe({
        next: (res):void => {
        this.#triageColors.set(res.data);
        },
        error: (err) => {
          console.error('Errore durante il fetch dei colori del triange', err)
        },
    })
  }
  
  private fetchPathology() { 
    this.#http.get<APIResponse<Pathology[]>>(`${environment.apiUrl}/resources/pathologies`)
      .subscribe({
        next: (res):void => {
        this.#pathologies.set(res.data);
        },
        error: (err) => {
          console.error('Errore durante il fetch delle patologie', err)
        },
    })
  }
  private fetchArrivalMode() { 
    this.#http.get<APIResponse<ArrivalMode[]>>(`${environment.apiUrl}/resources/arrival-modes`)
      .subscribe({
        next: (res):void => {
        this.#arrivalModes.set(res.data);
        },
        error: (err) => {
          console.error('Errore durante il fetch delle modalita di arrivo', err)
        },
    })
  }
}
