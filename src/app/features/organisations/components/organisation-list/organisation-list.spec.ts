import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganisationList } from './organisation-list';

describe('OrganisationList', () => {
  let component: OrganisationList;
  let fixture: ComponentFixture<OrganisationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganisationList],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganisationList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
