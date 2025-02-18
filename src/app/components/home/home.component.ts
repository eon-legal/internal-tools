import { Component } from '@angular/core';
import { DownloadPdfComponent } from '../download-pdf/download-pdf.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DownloadPdfComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
