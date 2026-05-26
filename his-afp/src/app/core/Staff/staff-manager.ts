import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Staff } from './staff.model';
import { APIResponse } from '../models/APIResponse.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StaffManager {
  readonly #http = inject(HttpClient);
  readonly #staff = signal<Staff[]>([]);
  staff = this.#staff.asReadonly();

  public fetchStaff() {
    this.#http.get<APIResponse<Staff[]>>(`${environment.apiUrl}/users`).subscribe({
      next: (res: APIResponse<Staff[]>) => {
        console.log('Staff recuperato:', res.data);
        this.#staff.set(res.data);
      },
      error: (err) => {
        console.error('Errore durante il recupero dei membri dello staff:', err);
      },
    });
  }
}
