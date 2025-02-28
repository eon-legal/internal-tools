import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [PanelMenuModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() isOpen = false; // Recibe el estado del menú
  @Input() menuItems: MenuItem[] = []; // Recibe los items del menú
  @Output() close = new EventEmitter<void>(); // Emite el cierre del menú
}