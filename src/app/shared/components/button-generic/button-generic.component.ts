import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { NgClass } from '@angular/common';
import { ButtonConfig, ButtonGenericInterface } from './interfaces/buttons';

@Component({
  selector: 'app-button-generic',
  standalone: true,
  imports: [ButtonModule, TooltipModule, NgClass],
  templateUrl: './button-generic.component.html',
  styleUrl: './button-generic.component.scss',
})
export class ButtonGenericComponent {
  /**
   *  Recibe una entrada llamada 'buttons' que sigue la interfaz ButtonGenericInterface
   */
  @Input() buttons!: ButtonGenericInterface;

  /**
   * Método para mostrar u ocultar un botón basado en una condición.
   * @param button - Configuración del botón (tipo ButtonConfig).
   * @returns `true` si el botón debe mostrarse, `false` si debe ocultarse.
   */
  showHideButton(button: ButtonConfig): boolean {
    // Verifica si el botón tiene una función 'hideDependsFunction' y si es una función válida
    if (
      'hideDependsFunction' in button &&
      typeof button?.hideDependsFunction === 'function'
    ) {
      // Ejecuta la función 'hideDependsFunction' y devuelve `false` si la función devuelve `true`, y viceversa
      return button?.hideDependsFunction() ? false : true;
    }
    // Si no hay una función 'hideDependsFunction', el botón se muestra por defecto
    return true;
  }
}
