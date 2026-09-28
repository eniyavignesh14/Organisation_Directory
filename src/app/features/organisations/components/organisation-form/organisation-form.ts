import { Component, input, output, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Organisation, OrganisationStatus } from '../../../../core/models/organisation.model';
import en from '../../../../../assets/i18n/en.json';

export interface OrganisationDraft {
  name: string;
  status: Exclude<OrganisationStatus, 'unknown'>;
  ownerEmail: string;
  memberCount: number | null;
}

const trimmedNameValidator: ValidatorFn = (control) => {
  const value = typeof control.value === 'string' ? control.value.trim() : '';
  if (value.length === 0) return { required: true };
  if (value.length < 3) return { minlength: true };
  if (value.length > 80) return { maxlength: true };
  return null;
};

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-organisation-form',
  styleUrl: './organisation-form.css',
  templateUrl: './organisation-form.html',
})
export class OrganisationForm {
  protected readonly t = en;
  readonly existingOrganisations = input<Organisation[]>([]);
  readonly created = output<OrganisationDraft>();
  readonly cancelled = output<void>();
  protected readonly submitted = signal(false);

  protected readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [trimmedNameValidator],
    }),
    status: new FormControl<Exclude<OrganisationStatus, 'unknown'> | ''>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    ownerEmail: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    memberCount: new FormControl('', {
      nonNullable: true,
      validators: [Validators.pattern(/^\d+$/), Validators.maxLength(15)],
    }),
  });

  protected validateUniqueName(): void {
    const control = this.form.controls.name;
    const normalizedName = control.value.trim().toLocaleLowerCase();
    const duplicate = normalizedName.length > 0 && this.existingOrganisations().some(
      (organisation) => organisation.name.trim().toLocaleLowerCase() === normalizedName,
    );
    const errors = { ...control.errors };
    delete errors['duplicate'];

    if (duplicate) {
      errors['duplicate'] = true;
    }

    control.setErrors(Object.keys(errors).length > 0 ? errors : null);
  }

  protected submit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    this.validateUniqueName();

    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    if (value.status === '') return;

    this.created.emit({
      name: value.name.trim(),
      status: value.status,
      ownerEmail: value.ownerEmail.trim(),
      memberCount: value.memberCount === '' ? null : Number(value.memberCount),
    });
  }

  protected cancel(): void {
    this.cancelled.emit();
  }
}
