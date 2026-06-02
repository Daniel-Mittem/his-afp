import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Message } from 'primeng/message';
import { PatientManager } from '../../core/Pazienti/patient-manager';
import { Button } from 'primeng/button';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'his-ricerca-pz',
  imports: [
    InputText,
    ReactiveFormsModule,
    FormsModule,
    FloatLabel,
    IconField,
    InputIcon,
    Message,
    CommonModule,
  ],
  templateUrl: './ricerca-pz.html',
  styleUrl: './ricerca-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RicercaPz {
  patientManager = inject(PatientManager);
  #router = inject(Router);
  readonly #fb = inject(FormBuilder);

  isSearching = signal(false);
  searchError = signal<string | null>(null);

  paziente = this.#fb.group({
    anagrafica: this.#fb.group({
      codiceFiscale: [
        '',
        [Validators.required, Validators.pattern('[A-Z]{6}\\d{2}[A-Z]\\d{2}[A-Z]\\d{3}[A-Z]')],
      ],
    }),
  });

  checkFormControl(control: string) {
    const fc = this.paziente.get(control);
    return fc?.invalid && (fc.touched || fc.dirty);
  }

  checkFormControlError(control: string, err: string) {
    const fc = this.paziente.get(control);
    if (fc && fc.hasError(err)) {
      return fc.getError(err);
    }
    return null;
  }

  async onSubmit() {
    if (this.paziente.valid) {
      const codiceFiscale = this.paziente.get('anagrafica.codiceFiscale')?.value;
      if (!codiceFiscale) return;

      this.isSearching.set(true);
      this.paziente.get('anagrafica.codiceFiscale')?.disable();
      this.searchError.set(null);

      try {
        const foundPatient = await this.patientManager.searchPatientByCodiceFiscale(codiceFiscale);

        this.isSearching.set(false);
        this.#router.navigate(['/accettazione-pz']);
      } catch (error) {
        this.searchError.set('Errore durante la ricerca del paziente. Riprovare.');
        this.isSearching.set(false);
        this.paziente.get('anagrafica.codiceFiscale')?.enable();
      }
    } else {
      this.paziente.markAllAsTouched();
    }
  }
}
