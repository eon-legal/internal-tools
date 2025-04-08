import { Component, inject } from '@angular/core';
import { LoadingService } from '../../../shared/services/loading/loading.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {
  loadingService: LoadingService = inject(LoadingService);
  loading$ = this.loadingService.loading$;
}
