import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganisationForm } from './organisation-form';

describe('OrganisationForm', () => {
  let component: OrganisationForm;
  let fixture: ComponentFixture<OrganisationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganisationForm],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganisationForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
