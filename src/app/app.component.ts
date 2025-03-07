import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonConfig } from './modules/invoices/interfaces/step-buttom';
import { ButtonListGenericComponent } from './shared/components/button-list-generic/button-list-generic.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ButtonListGenericComponent,
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  buttons: ButtonConfig[] = [
    { label: 'Primary', severity: 'primary', action: () => console.log('Primary clicked') },
    { label: 'Success', severity: 'success', action: () => console.log('Success clicked') },
    { label: 'Danger', severity: 'danger', disabled: true, action: () => console.log('Danger clicked') },
    { label: 'Warning', severity: 'warn', icon: 'pi pi-exclamation-triangle', action: () => console.log('Warning clicked') },
    { label: 'Info', severity: 'info', icon: 'pi pi-info-circle', iconPos: 'right', action: () => console.log('Info clicked') },
    { label: 'Small', size: 'small', action: () => console.log('Small clicked') },
    { label: 'Large', size: 'large', action: () => console.log('Large clicked') }
  ];
}