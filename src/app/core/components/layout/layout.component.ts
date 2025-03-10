import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ButtonModule } from 'primeng/button';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ContainComponent } from '../contain/contain.component';
import { MenuItem } from 'primeng/api';
import { NavigationEnd, Router } from '@angular/router';
import { MENU_ITEMS } from '../../constants/routes';
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    SplitButtonModule,
    ButtonModule,
    HeaderComponent,
    SidebarComponent,
    ContainComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit {
  isMenuOpen = false; // Controla el menú móvil
  menuItems: MenuItem[] = MENU_ITEMS;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Actualiza el estado del menú al iniciar la aplicación
    this.updateMenuState(this.router.url);

    // Escucha los cambios de URL
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateMenuState(event.url);
      }
    });
  }

  private updateMenuState(currentUrl: string): void {
    this.menuItems.forEach((item) => {
      // Verifica si el ítem coincide con la URL actual
      const isActive = item.routerLink && currentUrl.startsWith(item.routerLink[0]);

      // Agrega o quita la clase 'p-menuitem-active'
      if (isActive) {
        item.styleClass = 'p-menuitem-active';
      } else {
        item.styleClass = '';
      }

      // Verifica si alguno de los ítems hijos coincide con la URL actual
      if (item.items) {
        const isChildActive = item.items.some(
          (child) =>
            child.routerLink && currentUrl.startsWith(child.routerLink[0])
        );
        item.expanded = isChildActive; // Expande o colapsa el ítem

        // Agrega o quita la clase 'p-menuitem-parent-active'
        if (isChildActive) {
          item.styleClass = 'p-menuitem-parent-active';
        } else {
          item.styleClass = '';
        }
      }
    });
  }
}