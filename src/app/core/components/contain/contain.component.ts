import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contain',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './contain.component.html',
  styleUrl: './contain.component.scss',
})
export class ContainComponent {
  @Input() isMenuOpen = false; // Recibe el estado del menú
}
