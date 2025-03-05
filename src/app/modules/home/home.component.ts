import { Component } from '@angular/core';
import { ImagesToPdfComponent } from '../images-to-pdf/images-to-pdf.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ImagesToPdfComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
