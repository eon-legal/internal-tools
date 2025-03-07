import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-button-generic',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './button-generic.component.html',
  styleUrl: './button-generic.component.scss',
})
export class ButtonGenericComponent {
  @Input() label: string = 'Button';
  @Input() icon: string = '';
  @Input() iconPos: 'left' | 'right' = 'left';
  @Input() severity:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'help'
    | 'contrast' = 'primary';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() styleClass: string = '';
  @Input() tooltip: string = '';
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() rounded: boolean = false;
  @Input() raised: boolean = false;
  @Input() outlined: boolean = false;
  @Input() text: boolean = false;
  @Input() size: 'small' | 'large' = 'large';
  @Input() action?: () => void; // Propiedad action

  getStyleClass(): string {
    // Asegúrate de que styleClass no sea undefined o null
    let classes = this.styleClass || '';

    // Agregar clases según el tamaño
    if (this.size === 'small') {
      classes += ' p-button-sm';
    } else if (this.size === 'large') {
      classes += ' p-button-lg';
    }

    // Eliminar espacios en blanco al inicio y al final
    return classes.trim();
  }

  onClick(): void {
    if (this.action) {
      this.action(); // Ejecutar la acción si está definida
    }
  }
}
