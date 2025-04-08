import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Observable público para suscribirse al estado de loading
  loading$ = this.loadingSubject.asObservable();

  /**
   * show loading
   */
  show(): void {
    this.loadingSubject.next(true);
  }

  /**
   * hide  loading
   */
  hide(): void {
    this.loadingSubject.next(false);
  }
}
