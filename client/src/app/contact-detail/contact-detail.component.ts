import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactService } from '../services/contact-service/contact.service';

@Component({
  selector: 'contact-detail',
  templateUrl: './contact-detail.component.html',
  styleUrls: ['./contact-detail.component.scss']
})
export class ContactDetailComponent implements OnInit {
  contact: any;
  isEditMode = false;

  constructor(
    private route: ActivatedRoute,
    private contactService: ContactService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getContactDetail();
  }

  getContactDetail(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    this.contactService.getContactById(id).subscribe(data => {
      this.contact = data;
    });
  }

  onEdit(): void {
    this.isEditMode = true;
    this.router.navigate(['/contact-form', this.contact.id]);
  }

  onDelete(): void {
    this.contactService.deleteContact(this.contact.id).subscribe(() => {
      this.router.navigate(['/contacts']);
    });
  }

  onSave(): void {
    this.contactService.updateContact(this.contact).subscribe(() => {
      this.isEditMode = false;
      this.router.navigate(['/contacts']);
    });
  }
}
