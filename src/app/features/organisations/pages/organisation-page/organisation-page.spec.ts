import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { OrganisationService } from '../../../../core/services/organisation.service';
import { OrganisationPage } from './organisation-page';

describe('OrganisationPage', () => {
  let component: OrganisationPage;
  let fixture: ComponentFixture<OrganisationPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganisationPage],
      providers: [
        provideRouter([]),
        { provide: OrganisationService, useValue: { getAll: () => of([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganisationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
