import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { StepperModule } from 'primeng/stepper';
import { ButtonGenericComponent } from '../button-generic/button-generic.component';
import { ButtonGenericInterface } from '../button-generic/interfaces/buttons';

/**
 * StepperContextComponent is a reusable component that provides a stepperButtons interface.
 * It dynamically displays buttons based on the current step index and the provided stepperButtons configuration.
 */
@Component({
  selector: 'app-stepper-context',
  standalone: true,
  imports: [StepperModule, CommonModule, ButtonGenericComponent], // Imports necessary modules and components
  templateUrl: './stepper-context.component.html', // Template for the stepperButtons
  styleUrl: './stepper-context.component.scss', // Styles for the stepperButtons
})
export class StepperContextComponent {
  /**
   * Input property to receive the current step index.
   * Determines which buttons to display based on the step.
   * @type {number}
   * @default 1
   */
  @Input() index: number = 1;

  /**
   * Input property to receive the stepperButtons configuration.
   * Contains the buttons to be displayed in the stepperButtons.
   * @type {ButtonGenericInterface}
   */
  @Input() stepperButtons!: ButtonGenericInterface;
}
