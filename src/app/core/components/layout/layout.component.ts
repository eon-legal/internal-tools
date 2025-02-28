import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ButtonModule } from 'primeng/button';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ContainComponent } from '../contain/contain.component';
import { MenuItem } from 'primeng/api';
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
export class LayoutComponent {
  isMenuOpen = false; // Controla el menú móvil
  menuItems: MenuItem[] = this.getMenuItems();

  private getMenuItems(): MenuItem[] {
    return [
      {
        label: 'Imagen - PDF',
        icon: 'pi pi-home',
        routerLink: ['/']
      },
      {
        label: 'Reportes',
        icon: 'pi pi-chart-bar',
        items: [
          {
            label: 'Facturas',
            icon: 'pi pi-id-card',
            routerLink: ['/invoices']
          }
        ]
      }
    ];
  }
}