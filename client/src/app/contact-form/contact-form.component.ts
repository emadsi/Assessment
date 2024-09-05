import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactService } from '../services/contact-service/contact.service';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent implements OnInit {
  contactForm: FormGroup;
  contactId: number;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: [''],
      image: ['']
    });
  }

  ngOnInit(): void {
    this.contactId = +this.route.snapshot.paramMap.get('id');
    if (this.contactId) {
      this.contactService.getContactById(this.contactId).subscribe(contact => {
        if (contact) {
          this.contactForm.patchValue(contact);
        }
      });
    }
  }

  onSubmit() {
    if (this.contactForm.valid) {
      if (this.contactId) {
        this.contactService.updateContact({ id: this.contactId, ...this.contactForm.value }).subscribe(() => {
          this.router.navigate(['/contacts']);
        });
      } else {
        this.contactService.addContact(this.contactForm.value).subscribe(() => {
          this.router.navigate(['/contacts']);
        });
      }
    }
  }
}
