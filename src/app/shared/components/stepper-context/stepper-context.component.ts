import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { StepperModule } from 'primeng/stepper';
import { StepInterface } from '../../interfaces/stepper';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-stepper-context',
  standalone: true,
  imports: [StepperModule, CommonModule, ButtonModule],
  templateUrl: './stepper-context.component.html',
  styleUrl: './stepper-context.component.scss',
})
export class StepperContextComponent {
  @Input() index: number = 1;
  @Input() stepper: StepInterface[] = [];
  getArrayButtons() {
    if (this.stepper.length >= this.index) {
      return this.stepper[this.index - 1]?.buttons || [];
    }
    return [];
  }
  getClass(): string{
    if (this.stepper.length >= this.index) {
      return this.stepper[this.index - 1]?.css || '';
    }
    return '';
  }
}
