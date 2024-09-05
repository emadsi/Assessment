import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SyncService } from './services/sync-service/sync-service.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private syncService: SyncService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('online', () => this.syncUnsyncedContacts());
      if (navigator.onLine) {
        this.syncUnsyncedContacts();
      }
    }
  }

  syncUnsyncedContacts(): void {
    this.syncService.syncUnsyncedContacts().subscribe({
      next: () => console.log('Synchronization successful'),
      error: (err) => console.error('Synchronization failed:', err)
    });
  }
}
