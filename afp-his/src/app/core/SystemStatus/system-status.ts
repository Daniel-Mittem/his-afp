import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { HealthStatus, healthStatusMock } from './healthStatus.model';
import { APIResponse } from '../models/APIResponse.model';

@Injectable({
  providedIn: 'root',
})
export class SystemStatus {
  #http: HttpClient = inject(HttpClient);
  #statoApi = signal<HealthStatus>(healthStatusMock); 

  statoAPI = this.#statoApi.asReadonly();

  constructor() {
    this.fetchStatoApi();
  }

  public fetchStatoApi(): void {
    this.#http.get<APIResponse<HealthStatus>>('http://localhost:3000/health').subscribe({
      next: (res) => { 
        this.#statoApi.set(res.data)
      },
      error: (err) => {
        console.error(err); 
        this.#statoApi.set(healthStatusMock);
      },
    });
  }
}

