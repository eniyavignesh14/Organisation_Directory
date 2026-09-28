import { Component, input, output } from '@angular/core';
import { Organisation } from '../../../../core/models/organisation.model';
import { DatePipe } from '@angular/common';
import en from '../../../../../assets/i18n/en.json';

type ListState = 'loading' | 'error' | 'empty' | 'no-results' | 'ready';
type SortKey = 'name' | 'createdAt';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-organisation-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './organisation-list.html',
  styleUrl: './organisation-list.css',
})
export class OrganisationList {
  protected readonly t = en;
  readonly organisations = input<Organisation[]>([]);
  readonly state = input<ListState>('empty');
  readonly sortKey = input<SortKey>('name');
  readonly sortDirection = input<SortDirection>('asc');
  readonly retry = output<void>();
  readonly sortChange = output<SortKey>();

  protected statusLabel(status: Organisation['status']): string {
    switch (status) {
      case 'active': return this.t.statusActive;
      case 'inactive': return this.t.statusInactive;
      case 'suspended': return this.t.statusSuspended;
      default: return this.t.statusUnknown;
    }
  }
}