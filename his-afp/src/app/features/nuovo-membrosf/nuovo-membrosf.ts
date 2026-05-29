import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { Fieldset } from 'primeng/fieldset';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { GestioneRisorse } from '../../core/Risorse/gestione-risorse';
import { StaffManager } from '../../core/Staff/staff-manager';
import { Staff } from '../../core/Staff/staff.model';

@Component({
  selector: 'his-nuovo-membrosf',
  imports: [
    Button,
    Fieldset,
    InputText,
    Message,
    ReactiveFormsModule,
    Select,
  ],
  templateUrl: './nuovo-membrosf.html',
  styleUrl: './nuovo-membrosf.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuovoMembrosf {
  gestioneRisorse = inject(GestioneRisorse);
  staffManager = inject(StaffManager);

  readonly roleOptions = [
    {
      code: 'DOC',
      desc: 'Medico',
    },
    {
      code: 'INF',
      desc: 'Infermiere',
    },
    {
      code: 'AMM',
      desc: 'Amministrativo',
    },
  ];

  readonly #fb = inject(FormBuilder);
  staff = this.#fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
    role: ['', [Validators.required]],
  });

  checkFormControl(control: string) {
    const fc = this.staff.get(control);
    return fc?.invalid && (fc.touched || fc.dirty);
  }

  checkFormControlError(control: string, err: string) {
    const fc = this.staff.get(control);

    if (fc && fc.hasError(err)) {
      return fc.getError(err);
    } else {
      return null;
    }
  }

  onSubmit() {
    if (this.staff.valid) {
      console.log(this.staff.value);
      this.staffManager.admitStaff(this.staff.value as Staff);
    } else {
      this.staff.markAllAsTouched();
    }
  }
}
