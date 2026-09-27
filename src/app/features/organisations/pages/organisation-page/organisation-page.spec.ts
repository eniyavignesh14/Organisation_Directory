import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganisationPage } from './organisation-page';

describe('OrganisationPage', () => {
  let component: OrganisationPage;
  let fixture: ComponentFixture<OrganisationPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganisationPage],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganisationPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
