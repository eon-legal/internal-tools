import { Component, HostListener } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PanelMenuModule } from 'primeng/panelmenu';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PanelMenuModule,
    SplitButtonModule,
    ButtonModule,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  sidebarVisible = true;
  isMobile = false;
  sidebarMobileVisible = false;
  menuItems: MenuItem[] = [];
  profileItems: MenuItem[] = [];

  ngOnInit() {
    this.checkViewport();
    this.initMenu();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkViewport();
    if (!this.isMobile) {
      this.sidebarMobileVisible = false;
    }
  }

  private checkViewport() {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) this.sidebarMobileVisible = false;
  }

  private initMenu() {
    this.menuItems = [
      {
        label: 'Inicio',
        icon: 'pi pi-home',
        routerLink: [''],
      },
      /*{
        label: 'Usuarios',
        icon: 'pi pi-users',
        items: [
          { label: 'Listado', icon: 'pi pi-list', routerLink: ['/users'] },
          { label: 'Nuevo', icon: 'pi pi-plus', routerLink: ['/users/new'] }
        ]
      },*/
      {
        label: 'Reportes',
        icon: 'pi pi-chart-bar',
        items: [
          //{ label: 'Ventas', icon: 'pi pi-dollar' },
          {
            label: 'Facturas',
            icon: 'pi pi-id-card',
            routerLink: ['/invoices'],
          },
        ],
      },
    ];

    /*this.profileItems = [
      { label: 'Mi Perfil', icon: 'pi pi-user' },
      { label: 'Configuración', icon: 'pi pi-cog' },
      { separator: true },
      { label: 'Cerrar Sesión', icon: 'pi pi-power-off' },
    ];*/
  }

  toggleMobileSidebar() {
    this.sidebarMobileVisible = !this.sidebarMobileVisible;
  }

  closeMobileSidebar() {
    if (this.isMobile) {
      this.sidebarMobileVisible = false;
    }
  }
}
