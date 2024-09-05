import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Contact } from '../../models/contact/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:3000/contacts';
  private localStorageKey = 'localContacts';

  constructor(private http: HttpClient) {}

  private getLocalContacts(): any[] {
    const contacts = localStorage.getItem(this.localStorageKey);
    return contacts ? JSON.parse(contacts) : [];
  }

  private saveLocalContacts(contacts: any[]): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(contacts));
  }

  getContacts(): Observable<Contact[]> {
    if (!navigator.onLine) {
      const localContacts = this.getLocalContacts();
      return of(localContacts);
    }

    return this.http.get<Contact[]>(this.apiUrl).pipe(
      map(contacts => {
        this.saveLocalContacts(contacts);
        return contacts;
      }),
      catchError(error => {
        console.error('Fetch error:', error);
        const localContacts = this.getLocalContacts();
        return of(localContacts);
      })
    );
  }

  getContactById(id: number): Observable<Contact> {
    if (!navigator.onLine) {
      const contact = this.getLocalContacts().find(c => c.id === id);
      return contact ? of(contact) : throwError('Contact not found');
    }

    return this.http.get<Contact>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Fetch error:', error);
        const contact = this.getLocalContacts().find(c => c.id === id);
        return contact ? of(contact) : throwError('Contact not found');
      })
    );
  }

  addContact(contact: any): Observable<any> {
    if (!navigator.onLine) {
      const localContacts = this.getLocalContacts();
      contact.id = localContacts.length + 1;
      localContacts.push(contact);
      this.saveLocalContacts(localContacts);
      return of(contact);
    }

    return this.http.post<Contact>(this.apiUrl, contact).pipe(
      map(newContact => {
        const localContacts = this.getLocalContacts();
        localContacts.push(newContact);
        this.saveLocalContacts(localContacts);
        return newContact;
      })
    );
  }

  updateContact(contact: Contact): Observable<any> {
    if (!navigator.onLine) {
      const localContacts = this.getLocalContacts();
      const index = localContacts.findIndex(c => c.id === contact.id);
      if (index !== -1) {
        localContacts[index] = contact;
        this.saveLocalContacts(localContacts);
      }
      return of(contact);
    }

    return this.http.put<Contact>(`${this.apiUrl}/${contact.id}`, contact).pipe(
      map(() => {
        const localContacts = this.getLocalContacts();
        const index = localContacts.findIndex(c => c.id === contact.id);
        if (index !== -1) {
          localContacts[index] = contact;
          this.saveLocalContacts(localContacts);
        }
        return contact;
      })
    );
  }

  deleteContact(id: number): Observable<any> {
    if (!navigator.onLine) {
      const localContacts = this.getLocalContacts();
      const index = localContacts.findIndex(c => c.id === id);
      if (index !== -1) {
        localContacts.splice(index, 1);
        this.saveLocalContacts(localContacts);
      }
      return of({ id });
    }

    return this.http.delete<number>(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        const localContacts = this.getLocalContacts();
        const index = localContacts.findIndex(c => c.id === id);
        if (index !== -1) {
          localContacts.splice(index, 1);
          this.saveLocalContacts(localContacts);
        }
        return { id };
      })
    );
  }

  addRandomContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>('https://randomuser.me/api/?results=10').pipe(
      tap(users => {
        const contacts = users.map(user => ({
          name: `${user.name}`,
          email: user.email,
          phone: user.phone,
          image: user.image,
          address: `${user.address}`
        }));
        contacts.forEach(contact => {
          this.http.post(this.apiUrl, contact).subscribe();
        });
      })
    );
  }
  
}