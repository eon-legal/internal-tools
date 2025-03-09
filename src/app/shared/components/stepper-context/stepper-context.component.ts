import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { StepperModule } from 'primeng/stepper';
import { ButtonGenericComponent } from '../button-generic/button-generic.component';
import { ButtonGenericInterface } from '../../interfaces/buttons';

@Component({
  selector: 'app-stepper-context',
  standalone: true,
  imports: [StepperModule, CommonModule, ButtonGenericComponent],
  templateUrl: './stepper-context.component.html',
  styleUrl: './stepper-context.component.scss',
})
export class StepperContextComponent {
  @Input() index: number = 1;
  @Input() stepper: ButtonGenericInterface;
  getArrayButtons() {
    if (this.stepper?.buttons?.length >= this.index) {
      if (this.index === 1) {
        return this.stepper?.buttons?.filter(
          (bt) => bt.id === 1 || bt.id === 2
        );
      }
      if (this.index === 2) {
        return this.stepper?.buttons?.filter(
          (bt) => bt.id === 3 || bt.id === 4
        );
      }
      if (this.index === 3) {
        return this.stepper?.buttons?.filter(
          (bt) => bt.id === 5 || bt.id === 6
        );
      }
    }
    return [];
  }
}
