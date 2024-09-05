import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContactService } from '../services/contact-service/contact.service';

@Component({
  selector: 'contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss']
})
export class ContactListComponent implements OnInit {
  contacts: any[] = [];

  constructor(private contactService: ContactService,public router: Router) { }

  ngOnInit(): void {
    this.getContacts();
  }

  getContacts(): void {
    this.contactService.getContacts().subscribe(data => {
      this.contacts = data.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  onAddRandomContacts(): void {
    this.contactService.addRandomContacts().subscribe(() => {
      this.getContacts();
    });
  }

  onNewContact(): void {
    this.router.navigate(['/contact-form']);
  }
}
