import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Staff } from './staff.model';
import { APIResponse } from '../models/APIResponse.model';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class StaffManager {
  readonly #http = inject(HttpClient);
  readonly #staff = signal<Staff[]>([]);
  staff = this.#staff.asReadonly();
  readonly #router = inject(Router);

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

  public admitStaff(sf: Staff) {
    this.#http.post<APIResponse<Staff>>(`${environment.apiUrl}/users`, sf).subscribe({
      next: (res) => {
        this.#router.navigate([`/modificamemsf/${res.data.id}`]);
      },
      error: (err) => {
        console.error("Errore durante l'aggiunta di un membro dello staff:", err);
      },
    });
  }

  public updateStaffInfo(id: number) {
    this.#http.patch<APIResponse<Staff>>(`${environment.apiUrl}/users/${id}`, {}).subscribe({
      next: (res) => {
        this.#router.navigate([`/staff`]);
      },
      error: (err) => {
        console.error(
          "Errore durante l'aggiornamento delle informazioni di un membro dello staff:",
          err,
        );
      },
    });
  }

  public toggleStaffStatus(id: number, isActive: boolean) {
    const endpoint = isActive ? 'deactivate' : 'activate';
    this.#http.patch<APIResponse<Staff>>(`${environment.apiUrl}/users/${id}/${endpoint}`, {}).subscribe({
      next: (res) => {
        this.fetchStaff();
      },
      error: (err) => {
        console.error(
            "Errore durante l'aggiornamento dello stato dello staff:",
            err
        );
      },
    });
  }
}
