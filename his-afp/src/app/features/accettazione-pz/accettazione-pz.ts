import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { GestioneRisorse } from '../../core/Risorse/gestione-risorse';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { DatePicker } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Fieldset } from 'primeng/fieldset';
import { PatientManager } from '../../core/Pazienti/patient-manager';
import { PatientAdmission, PazienteDTO } from '../../core/Pazienti/Pazienti.model';
import { RicercaPaziente } from '../../pattern/ricerca-paziente/ricerca-paziente';
import { Divider } from 'primeng/divider';
import { Tag } from 'primeng/tag';

type FaseAccettazione = 'ricerca' | 'form';

@Component({
  selector: 'his-accettazione-pz',
  imports: [
    InputText,
    ReactiveFormsModule,
    Button,
    Message,
    DatePicker,
    SelectModule,
    Textarea,
    Fieldset,
    RicercaPaziente,
    Divider,
    Tag,
  ],
  templateUrl: './accettazione-pz.html',
  styleUrl: './accettazione-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccettazionePz {
  gestioneRisorse = inject(GestioneRisorse);
  patientManager = inject(PatientManager);

  readonly maxDate = new Date();
  readonly sexOption = [
    { code: 'M', desc: 'Maschio' },
    { code: 'F', desc: 'Femmina' },
  ];

  fase = signal<FaseAccettazione>('ricerca');
  pazienteTrovato = signal<PazienteDTO | null>(null);

  labelAnagrafica = computed(() =>
    this.pazienteTrovato()
      ? `Dati di ${this.pazienteTrovato()!.cognome} ${this.pazienteTrovato()!.nome} (CF: ${this.pazienteTrovato()!.codiceFiscale})`
      : 'Nuovo paziente',
  );

  readonly #fb = inject(FormBuilder);

  paziente = this.#fb.group({
    anagrafica: this.#fb.group({
      nome: ['', [Validators.required]],
      cognome: ['', [Validators.required]],
      dataNascita: [new Date(), [Validators.required]],
      codiceFiscale: [
        '',
        [Validators.required, Validators.pattern('[A-Z]{6}\\d{2}[A-Z]\\d{2}[A-Z]\\d{3}[A-Z]')],
      ],
      sesso: ['', [Validators.required]],
    }),
    sanitaria: this.#fb.group({
      patologia: ['', [Validators.required]],
      codiceColore: ['', [Validators.required]],
      modArrivo: ['', [Validators.required]],
      noteTriage: ['', [Validators.required, Validators.maxLength(500)]],
    }),
    residenza: this.#fb.group({
      via: [''],
      civico: [''],
      comune: [''],
      provincia: [''],
    }),
  });

  onPazienteSelezionato(pz: PazienteDTO | null) {
    this.pazienteTrovato.set(pz);

    if (pz) {
      this.paziente.patchValue({
        anagrafica: {
          nome: pz.nome,
          cognome: pz.cognome,
          dataNascita: new Date(pz.dataNascita),
          codiceFiscale: pz.codiceFiscale,
          sesso: pz.sex,
        },
        residenza: {
          via: pz.indirizzoVia,
          civico: pz.indirizzoCivico,
          comune: pz.comune,
          provincia: pz.provincia,
        },
      });
      this.paziente.get('anagrafica')?.disable();
      this.paziente.get('residenza')?.disable();
    } else {
      this.paziente.get('anagrafica')?.reset();
      this.paziente.get('anagrafica')?.enable();
      this.paziente.get('residenza')?.reset();
      this.paziente.get('residenza')?.enable();
    }

    this.paziente.get('sanitaria')?.reset();
    this.fase.set('form');
  }

  tornaRicerca() {
    this.fase.set('ricerca');
    this.pazienteTrovato.set(null);
    this.paziente.reset();
    this.paziente.get('anagrafica')?.enable();
    this.paziente.get('residenza')?.enable();
  }

  checkFormControl(control: string) {
    const fc = this.paziente.get(control);
    return fc?.invalid && (fc.touched || fc.dirty);
  }

  checkFormControlError(control: string, err: string) {
    const fc = this.paziente.get(control);
    return fc?.hasError(err) ? fc.getError(err) : null;
  }

  onSubmit() {
    if (this.paziente.valid) {
      const raw = this.paziente.getRawValue();

      const dataNascitaVal = raw.anagrafica?.dataNascita;
      const dataNascitaStr =
        dataNascitaVal instanceof Date
          ? dataNascitaVal.toISOString().split('T')[0]
          : dataNascitaVal !== null && dataNascitaVal !== undefined
            ? String(dataNascitaVal)
            : '';

      const payload: PatientAdmission = {
        anagrafica: {
          nome: raw.anagrafica.nome ?? '',
          cognome: raw.anagrafica.cognome ?? '',
          dataNascita: dataNascitaStr,
          codiceFiscale: raw.anagrafica.codiceFiscale ?? '',
          sesso: raw.anagrafica.sesso ?? '',
        },
        sanitaria: {
          patologia: raw.sanitaria.patologia ?? '',
          codiceColore: raw.sanitaria.codiceColore ?? '',
          modArrivo: raw.sanitaria.modArrivo ?? '',
          noteTriage: raw.sanitaria.noteTriage ?? '',
        },
        residenza: {
          via: raw.residenza.via ?? '',
          civico: raw.residenza.civico ?? '',
          comune: raw.residenza.comune ?? '',
          provincia: raw.residenza.provincia ?? '',
        },
      };

      this.patientManager.admitPatient(payload);
    } else {
      this.paziente.markAllAsTouched();
    }
  }
}
