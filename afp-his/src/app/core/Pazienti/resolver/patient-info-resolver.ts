import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ResolveFn, Router, } from '@angular/router';
import { environment } from '../../../../environments/environment.development';
import { catchError, Observable, of } from 'rxjs';
import { APIResponse } from '../../models/APIResponse.model';
import { PazienteDTO } from '../Pazienti.model';

/**
 * SE OK -> ROUTE TO modifica-pz
 * SE KO -> ROUTE TO accettazione-pz
 * @param route 
 * @returns 
 */
export const patientInfoResolver: ResolveFn<Observable<APIResponse<PazienteDTO> | undefined>> = (route) => {
  const router = inject(Router);
  const patientId = route.paramMap.get('patientID');
  const http = inject(HttpClient);
  
  return http.get<APIResponse<PazienteDTO>>(`${environment.apiUrl}/admissions/${patientId}`)
    .pipe(catchError((err) => {
      console.error('Errore durante il fetch del paziente')
      router.navigate(['/accetazione-pz']);
      return of(undefined);
    })
  );
};

