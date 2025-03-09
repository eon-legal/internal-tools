import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { NgClass } from '@angular/common';
import { ButtonConfig, ButtonGenericInterface } from '../../interfaces/buttons';

@Component({
  selector: 'app-button-generic',
  standalone: true,
  imports: [ButtonModule, NgClass],
  templateUrl: './button-generic.component.html',
  styleUrl: './button-generic.component.scss',
})
export class ButtonGenericComponent {
  @Input() buttons: ButtonGenericInterface;
  showHideButton(button: ButtonConfig): boolean {
    if (
      'hideDependsFunction' in button &&
      typeof button?.hideDependsFunction === 'function'
    ) {
      return button?.hideDependsFunction() ? false : true;
    }
    return true;
  }
}
