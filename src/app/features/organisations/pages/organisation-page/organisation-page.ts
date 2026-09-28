import { Component } from '@angular/core';
import { OrganisationList } from '../../components/organisation-list/organisation-list';

@Component({
  selector: 'app-organisation-page',
  standalone: true,
  imports: [OrganisationList],
  templateUrl: './organisation-page.html',
  styleUrl: './organisation-page.css',
})
export class OrganisationPage {}