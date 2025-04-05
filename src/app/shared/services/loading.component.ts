import { Component, inject } from '@angular/core';
import { LoadingService } from './loading.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  template: `
    @if (loading$ | async) {
    <div class="loading-overlay">
      <!--<p-progressSpinner
        styleClass="w-12 h-12"
        strokeWidth="6"
        animationDuration="1s"
        fill="#EEEEEE"
        ariaLabel="loading"
      ></p-progressSpinner>-->
      <p-progress-spinner ariaLabel="loading" />
    </div>
    }
  `,
  styles: [
    `
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      ::ng-deep .p-progress-spinner-circle {
        stroke: var(--primary-color) !important;
      }
    `,
  ],
})
export class LoadingComponent {
  loadingService: LoadingService = inject(LoadingService);
  loading$ = this.loadingService.loading$;
}
