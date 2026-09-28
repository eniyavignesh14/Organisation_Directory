import { Component, inject,OnInit, signal } from '@angular/core';
import { Organisation } from '../../../../core/models/organisation.model';
import { OrganisationService } from '../../../../core/services/organisation.service';
import { DatePipe } from '@angular/common';



@Component({
  selector: 'app-organisation-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './organisation-list.html',
  styleUrl: './organisation-list.css',
})
export class OrganisationList implements OnInit{
  private readonly organisationService = inject(OrganisationService);

  protected readonly organisations = signal<Organisation[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal(false);

  protected readonly page = signal(0);
  protected readonly pageSize = 25;
  protected readonly total = signal(0);
  protected readonly Math = Math;

 ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(false);

    this.organisationService.getPage(this.page(), this.pageSize).subscribe({
      next: (response) => {
        this.organisations.set(response.items);
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
    protected previousPage(): void {
    if (this.page() === 0) {
      return;
    }

    this.page.update((value) => value - 1);
    this.load();
  }

  protected nextPage(): void {
    const lastPage = Math.ceil(this.total() / this.pageSize) - 1;

    if (this.page() >= lastPage) {
      return;
    }

    this.page.update((value) => value + 1);
    this.load();
  }
}