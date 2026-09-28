import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, mergeMap, of, throwError, timer } from 'rxjs';
import { Organisation } from '../models/organisation.model';
import en from '../../../assets/i18n/en.json';

interface RawOrganisation {
  id: number;
  name: string | null;
  status: string | null;
  memberCount: number | string | null;
  owner?: {
    email?: string | null;
  };
  createdAt: string | number | null;
}

@Injectable({
  providedIn: 'root',
})
export class OrganisationService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Organisation[]> {
    return this.http
      .get<RawOrganisation[]>('/data/organisations.json')
      .pipe(
        mergeMap((records) =>
          timer(this.randomDelay()).pipe(
            mergeMap(() =>
              Math.random() < 0.15
                ? throwError(() => new Error('Mock list request failed'))
                : of(records),
            ),
          ),
        ),
        map((records) =>
          this.expandFixture(records).map((record) => this.normalize(record)),
        ),
      );
  }

  private randomDelay(): number {
    return Math.floor(Math.random() * 501) + 400;
  }

  private expandFixture(
    records: RawOrganisation[],
  ): RawOrganisation[] {
    const expanded = [...records];

    for (let index = 0;  expanded.length < 137; index++) {
      const source = records[index % records.length];

      expanded.push({
        ...source,
        id: 100 + index,
        name:
          index % 9 === 0
            ? ''
            : index % 11 === 0
              ? null
              : `${source.name ?? en.unnamed} ${index + 1}`,
        status:
          index % 13 === 0
            ? 'actve'
            : index % 17 === 0
              ? 'ACTIVE'
              : source.status,
        memberCount:
          index % 10 === 0
            ? -1
            : index % 7 === 0
              ? String(index + 5)
              : source.memberCount,
        createdAt:
          index % 12 === 0
            ? 'not a date'
            : source.createdAt,
      });
    }

    return expanded;
  }

  private normalize(raw: RawOrganisation): Organisation {
    return {
      id: raw.id,
      name: this.normalizeName(raw.name),
      status: this.normalizeStatus(raw.status),
      memberCount: this.normalizeMemberCount(raw.memberCount),
      ownerEmail: this.normalizeEmail(raw.owner?.email),
      createdAt: this.normalizeDate(raw.createdAt),
    };
  }

  private normalizeName(name: string | null): string {
    return name?.trim() ?? '';
  }

  private normalizeStatus(status: string | null): Organisation['status'] {
    const normalized = status?.trim().toLowerCase();

    switch (normalized) {
      case 'active':
        return 'active';

      case 'inactive':
        return 'inactive';

      case 'suspended':
        return 'suspended';

      default:
        return 'unknown';
    }
  }

  private normalizeMemberCount(
    memberCount: number | string | null,
  ): number | null {
    if (memberCount === null || memberCount === undefined) {
      return null;
    }

    const value = Number(memberCount);

    return Number.isFinite(value) && value >= 0 ? value : null;
  }

  private normalizeEmail(email: string | null | undefined): string | null {
    if (!email) {
      return null;
    }

    const value = email.trim();

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? value
      : null;
  }

  private normalizeDate(value: string | number | null): Date | null {
    if (value === null) {
      return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
  }
}