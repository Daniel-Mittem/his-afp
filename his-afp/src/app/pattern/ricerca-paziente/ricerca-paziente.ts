import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Message } from 'primeng/message';
import { SelectButton } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { APIResponse } from '../../core/models/APIResponse.model';
import { environment } from '../../../environments/environment';
import { PazienteDTO, PazienteDTORaw } from '../../core/Pazienti/Pazienti.model';

export type RicercaModalita = 'cf' | 'anagrafica';

@Component({
  selector: 'his-ricerca-paziente',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    InputText,
    Button,
    DatePicker,
    Message,
    SelectButton,
    SlicePipe,
  ],
  templateUrl: './ricerca-paziente.html',
  styleUrl: './ricerca-paziente.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RicercaPaziente {
  readonly #http = inject(HttpClient);
  readonly #fb = inject(FormBuilder);


  /** Emette il paziente selezionato (o null per procedere come nuovo) */
  pazienteSelezionato = output<PazienteDTO | null>();

  readonly maxDate = new Date();

  modalitaOptions = [
    { label: 'Codice Fiscale', value: 'cf' },
    { label: 'Nome / Cognome / Data di nascita', value: 'anagrafica' },
  ];

  modalita = signal<RicercaModalita>('cf');

  ricercaEseguita = signal(false);
  loading = signal(false);
  risultati = signal<PazienteDTO[]>([]);
  errore = signal<string | null>(null);

  haRisultati = computed(() => this.risultati().length > 0);
  nessunoTrovato = computed(() => this.ricercaEseguita() && !this.haRisultati() && !this.loading());


  formCF = this.#fb.group({
    codiceFiscale: [
      '',
      [
        Validators.required,
        Validators.pattern('[A-Za-z]{6}\\d{2}[A-Za-z]\\d{2}[A-Za-z]\\d{3}[A-Za-z]'),
      ],
    ],
  });

  formAnagrafica = this.#fb.group({
    nome: ['', [Validators.required]],
    cognome: ['', [Validators.required]],
    dataNascita: ['', [Validators.required]],
  });

  onModalitaChange(val: RicercaModalita) {
    this.modalita.set(val);
    this.risultati.set([]);
    this.ricercaEseguita.set(false);
    this.errore.set(null);
    this.formCF.reset();
    this.formAnagrafica.reset();
  }

  cerca() {
    this.errore.set(null);
    this.risultati.set([]);
    this.ricercaEseguita.set(false);

    if (this.modalita() === 'cf') {
      if (this.formCF.invalid) {
        this.formCF.markAllAsTouched();
        return;
      }
      this.#cercaByCF(this.formCF.value.codiceFiscale!.toUpperCase());
    } else {
      if (this.formAnagrafica.invalid) {
        this.formAnagrafica.markAllAsTouched();
        return;
      }
      const { nome, cognome, dataNascita } = this.formAnagrafica.value;
      const dataStr = this.#formatDateForApi(dataNascita as unknown as Date);
      this.#cercaByAnagrafica(nome!, cognome!, dataStr);
    }
  }

  seleziona(pz: PazienteDTO) {
    this.pazienteSelezionato.emit(pz);
  }

  procediNuovo() {
    this.pazienteSelezionato.emit(null);
  }

  #cercaByCF(cf: string) {
    this.loading.set(true);
    const url = `${environment.apiUrl}/patients/search?cf=${encodeURIComponent(cf)}`;
    this.#http.get<APIResponse<PazienteDTORaw[]>>(url).subscribe({
      next: (res) => {
        this.risultati.set(res.data.map((p) => this.#mapDTO(p)));
        this.ricercaEseguita.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.errore.set('Errore durante la ricerca. Riprovare.');
        this.ricercaEseguita.set(true);
        this.loading.set(false);
      },
    });
  }

  #cercaByAnagrafica(nome: string, cognome: string, dataNascita: string) {
    this.loading.set(true);
    const params = new URLSearchParams({ nome, cognome, data_nascita: dataNascita });
    const url = `${environment.apiUrl}/patients/search?${params}`;
    this.#http.get<APIResponse<PazienteDTORaw[]>>(url).subscribe({
      next: (res) => {
        this.risultati.set(res.data.map((p) => this.#mapDTO(p)));
        this.ricercaEseguita.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.errore.set('Errore durante la ricerca. Riprovare.');
        this.ricercaEseguita.set(true);
        this.loading.set(false);
      },
    });
  }

  #mapDTO(p: PazienteDTORaw): PazienteDTO {
    return {
      id: p.id,
      nome: p.nome,
      cognome: p.cognome,
      sex: p.sex,
      codiceFiscale: p.codice_fiscale,
      dataNascita: p.data_nascita,
      indirizzoVia: p.indirizzo_via,
      indirizzoCivico: p.indirizzo_civico,
      comune: p.comune,
      provincia: p.provincia,
      braccialetto: p.braccialetto,
      dataOraIngresso: p.data_ora_ingresso,
      stato: p.stato,
      noteTriage: p.note_triage,
      patologiaCode: p.patologia_code,
      patologiaDescrizione: p.patologia_descrizione,
      coloreCode: p.colore_code,
      coloreHex: p.colore_hex,
      coloreNome: p.colore_nome,
      modalitaArrivoCode: p.modalita_arrivo_code,
      modalitaArrivoDescrizione: p.modalita_arrivo_descrizione,
    };
  }
  #formatDateForApi(date: Date | string): string {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  getErrorCF(err: string) {
    const fc = this.formCF.get('codiceFiscale');
    return fc?.hasError(err) ? fc.getError(err) : null;
  }

  isCFInvalid() {
    const fc = this.formCF.get('codiceFiscale');
    return fc?.invalid && (fc.touched || fc.dirty);
  }

  getErrorAnagrafica(campo: string, err: string) {
    const fc = this.formAnagrafica.get(campo);
    return fc?.hasError(err) ? fc.getError(err) : null;
  }

  isAnagraficaInvalid(campo: string) {
    const fc = this.formAnagrafica.get(campo);
    return fc?.invalid && (fc.touched || fc.dirty);
  }
}
