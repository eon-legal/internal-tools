import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { StepperModule } from 'primeng/stepper';
import { ButtonGenericComponent } from '../button-generic/button-generic.component';
import { ButtonGenericInterface } from '../button-generic/interfaces/buttons';

/**
 * StepperContextComponent is a reusable component that provides a stepper interface.
 * It dynamically displays buttons based on the current step index and the provided stepper configuration.
 */
@Component({
  selector: 'app-stepper-context',
  standalone: true,
  imports: [StepperModule, CommonModule, ButtonGenericComponent], // Imports necessary modules and components
  templateUrl: './stepper-context.component.html', // Template for the stepper
  styleUrl: './stepper-context.component.scss', // Styles for the stepper
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
   * Input property to receive the stepper configuration.
   * Contains the buttons to be displayed in the stepper.
   * @type {ButtonGenericInterface}
   */
  @Input() stepper!: ButtonGenericInterface;

  /**
   * Returns an array of buttons to display based on the current step index.
   * Filters the buttons from the stepper configuration according to the step.
   * @returns {ButtonGenericInterface['buttons']} - An array of buttons for the current step.
   */
  getArrayButtons() {
    if (this.stepper?.buttons?.length && this.stepper?.buttons?.length >= this.index) {
      // Filters buttons for the first step
      if (this.index === 1) {
        return this.stepper?.buttons?.filter((bt) => bt.id === 1 || bt.id === 2);
      }
      // Filters buttons for the second step
      if (this.index === 2) {
        return this.stepper?.buttons?.filter((bt) => bt.id === 3 || bt.id === 4);
      }
      // Filters buttons for the third step
      if (this.index === 3) {
        return this.stepper?.buttons?.filter((bt) => bt.id === 5 || bt.id === 6);
      }
    }
    // Returns an empty array if no buttons match the current step
    return [];
  }
}
