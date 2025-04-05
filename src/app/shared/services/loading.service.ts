import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Observable público para suscribirse al estado de loading
  loading$ = this.loadingSubject.asObservable();

  constructor() {}

  /**
   * Muestra el loading
   */
  show(): void {
    this.loadingSubject.next(true);
  }

  /**
   * Oculta el loading
   */
  hide(): void {
    this.loadingSubject.next(false);
  }

  /**
   * Ejecuta una operación mostrando el loading automáticamente
   * @param operation Operación a ejecutar (debe devolver Promise)
   */
  async withLoading<T>(operation: () => Promise<T>): Promise<T> {
    try {
      this.show();
      return await operation();
    } finally {
      this.hide();
    }
  }
}
