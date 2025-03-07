import { Component, Input } from '@angular/core';
import { ButtonGenericComponent } from '../button-generic/button-generic.component';
import { ButtonConfig } from '../../../modules/invoices/interfaces/step-buttom';

@Component({
  selector: 'app-button-list-generic',
  standalone: true,
  imports: [ButtonGenericComponent],
  templateUrl: './button-list-generic.component.html',
  styleUrl: './button-list-generic.component.scss'
})
export class ButtonListGenericComponent {
  @Input() buttons: ButtonConfig[] = [];
}