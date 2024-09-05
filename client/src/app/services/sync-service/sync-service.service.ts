import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, concatMap, from, of, tap, throwError } from "rxjs";
import { Contact } from "../../models/contact/contact.model";

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  constructor(private http: HttpClient) {}

  syncUnsyncedContacts(): Observable<any> {
    const unsyncedContacts: Contact[] = JSON.parse(localStorage.getItem('unsyncedContacts') || '[]');
    if (unsyncedContacts.length === 0) {
      return of(null);
    }

    return from(unsyncedContacts).pipe(
      concatMap(contact => 
        this.http.post('http://localhost:3000/contacts', contact).pipe(
          tap(() => this.removeContactFromUnsynced(contact.id))
        )
      ),
      catchError(error => {
        console.error('Sync failed:', error);
        return throwError(() => new Error('Sync failed'));
      })
    );
  }

  private removeContactFromUnsynced(contactId: number): void {
    let unsyncedContacts = JSON.parse(localStorage.getItem('unsyncedContacts') || '[]');
    const index = unsyncedContacts.findIndex(contact => contact.id === contactId);
    if (index > -1) {
      unsyncedContacts.splice(index, 1);
      localStorage.setItem('unsyncedContacts', JSON.stringify(unsyncedContacts));
    }
  }
}
