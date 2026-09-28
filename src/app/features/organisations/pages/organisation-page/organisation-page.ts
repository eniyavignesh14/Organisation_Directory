import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Organisation, OrganisationStatus } from '../../../../core/models/organisation.model';
import { OrganisationService } from '../../../../core/services/organisation.service';
import { OrganisationDraft, OrganisationForm } from '../../components/organisation-form/organisation-form';
import { OrganisationList } from '../../components/organisation-list/organisation-list';
import en from '../../../../../assets/i18n/en.json';

type StatusFilter = 'all' | OrganisationStatus;
type SortKey = 'name' | 'createdAt';
type SortDirection = 'asc' | 'desc';
type ListState = 'loading' | 'error' | 'empty' | 'no-results' | 'ready';

@Component({
  selector: 'app-organisation-page',
  standalone: true,
  imports: [OrganisationForm, OrganisationList],
  templateUrl: './organisation-page.html',
  styleUrl: './organisation-page.css',
})
export class OrganisationPage implements OnInit {
  private readonly organisationService = inject(OrganisationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly destroyRef = inject(DestroyRef);
  private pendingSearchUpdate: ReturnType<typeof setTimeout> | undefined;

  protected readonly t = en;
  protected readonly organisations = signal<Organisation[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal(false);
  protected readonly formOpen = signal(false);
  protected readonly announcement = signal('');
  protected readonly searchInput = signal('');
  protected readonly searchText = signal('');
  protected readonly statusFilter = signal<StatusFilter>('all');
  protected readonly sortKey = signal<SortKey>('name');
  protected readonly sortDirection = signal<SortDirection>('asc');

  protected readonly filteredOrganisations = computed(() => {
    const query = this.searchText().trim().toLocaleLowerCase();
    const status = this.statusFilter();
    const sortKey = this.sortKey();
    const direction = this.sortDirection() === 'asc' ? 1 : -1;

    return this.organisations()
      .filter((organisation) => {
        const name = (organisation.name || this.t.unnamed).toLocaleLowerCase();
        const matchesName = name.includes(query);
        const matchesStatus = status === 'all' || organisation.status === status;
        return matchesName && matchesStatus;
      })
      .slice()
      .sort((left, right) => {
        if (sortKey === 'createdAt') {
          if (left.createdAt === null && right.createdAt === null) return 0;
          if (left.createdAt === null) return 1;
          if (right.createdAt === null) return -1;
          return (left.createdAt.getTime() - right.createdAt.getTime()) * direction;
        }

        const leftName = left.name || this.t.unnamed;
        const rightName = right.name || this.t.unnamed;
        return leftName.localeCompare(rightName) * direction;
      });
  });

  protected readonly listState = computed<ListState>(() => {
    if (this.loading()) return 'loading';
    if (this.error()) return 'error';
    if (this.organisations().length === 0) return 'empty';
    if (this.filteredOrganisations().length === 0) return 'no-results';
    return 'ready';
  });

  constructor() {
    this.title.setTitle(this.t.appTitle);
    this.destroyRef.onDestroy(() => {
      if (this.pendingSearchUpdate !== undefined) {
        clearTimeout(this.pendingSearchUpdate);
      }
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        if (this.pendingSearchUpdate !== undefined) {
          clearTimeout(this.pendingSearchUpdate);
          this.pendingSearchUpdate = undefined;
        }
        const query = params.get('q') ?? '';
        this.searchInput.set(query);
        this.searchText.set(query);

        const requestedStatus = params.get('status');
        this.statusFilter.set(this.isStatusFilter(requestedStatus) ? requestedStatus : 'all');
      });

    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.organisationService.getAll().subscribe({
      next: (organisations) => {
        this.organisations.set(organisations);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  protected onSearchInput(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;

    const query = target.value;
    this.searchInput.set(query);
    if (this.pendingSearchUpdate !== undefined) {
      clearTimeout(this.pendingSearchUpdate);
    }

    this.pendingSearchUpdate = setTimeout(() => {
      this.pendingSearchUpdate = undefined;
      this.searchText.set(query);
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { q: query.trim() || null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }, 300);
  }

  protected onStatusChange(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;

    const status = target.value;
    this.statusFilter.set(this.isStatusFilter(status) ? status : 'all');
    const query = this.searchInput().trim();
    if (this.pendingSearchUpdate !== undefined) {
      clearTimeout(this.pendingSearchUpdate);
      this.pendingSearchUpdate = undefined;
    }
    this.searchText.set(query);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: query || null,
        status: status === 'all' ? null : status,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected toggleSort(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
      return;
    }

    this.sortKey.set(key);
    this.sortDirection.set('asc');
  }

  protected addOrganisation(draft: OrganisationDraft): void {
    const id = Math.max(0, ...this.organisations().map((organisation) => organisation.id)) + 1;
    const organisation: Organisation = {
      id,
      name: draft.name,
      status: draft.status,
      memberCount: draft.memberCount,
      ownerEmail: draft.ownerEmail,
      createdAt: new Date(),
    };

    this.organisations.update((current) => [organisation, ...current]);
    this.formOpen.set(false);
    this.announcement.set(this.t.createSuccess);
  }

  protected resultCount(count: number): string {
    return this.t.resultCount.replace('{count}', String(count));
  }

  private isStatusFilter(value: string | null): value is StatusFilter {
    return value === 'all' || value === 'active' || value === 'inactive' ||
      value === 'suspended' || value === 'unknown';
  }
}