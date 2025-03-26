import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';

// Mock de ActivatedRoute
const mockActivatedRoute = {
  snapshot: {
    url: [],
  },
};

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  // Mock de los ítems del menú
  const mockMenuItems: MenuItem[] = [
    { label: 'Home', routerLink: ['/home'] },
    { label: 'About', routerLink: ['/about'] },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelMenuModule, RouterModule], // Importa los módulos necesarios
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute }, // Proporciona el mock de ActivatedRoute
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    component.menuItems = mockMenuItems; // Asigna los ítems del menú de prueba
    fixture.detectChanges();
  });

  // Prueba 1: Verificar que el componente se crea correctamente
  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  // Prueba 2: Verificar que el sidebar está cerrado por defecto
  it('debería estar cerrado por defecto', () => {
    expect(component.isOpen).toBe(false); // Verifica que el sidebar está cerrado
    const sidebarElement = fixture.nativeElement.querySelector('.sidebar');
    expect(sidebarElement.classList.contains('active')).toBe(false); // Verifica que no tiene la clase 'active'
  });

  // Prueba 3: Verificar que el sidebar se abre cuando isOpen es true
  it('debería abrirse cuando isOpen es true', () => {
    component.isOpen = true; // Abre el sidebar
    fixture.detectChanges();

    const sidebarElement = fixture.nativeElement.querySelector('.sidebar');
    expect(sidebarElement.classList.contains('active')).toBe(true); // Verifica que tiene la clase 'active'
  });

  // Prueba 4: Verificar que el evento close se emite al hacer clic en el overlay
  it('debería emitir el evento close al hacer clic en el overlay', () => {
    jest.spyOn(component.close, 'emit'); // Espía el método emit del EventEmitter

    const overlayElement = fixture.nativeElement.querySelector('.sidebar-overlay');
    overlayElement.click(); // Simula un clic en el overlay

    expect(component.close.emit).toHaveBeenCalled(); // Verifica que el evento se emitió
  });

  // Prueba 5: Verificar que los ítems del menú se renderizan correctamente
  it('debería renderizar los ítems del menú correctamente', () => {
    const panelMenuElement = fixture.nativeElement.querySelector('p-panelMenu');
    expect(panelMenuElement).toBeTruthy(); // Verifica que el componente p-panelMenu está presente
    expect(component.menuItems.length).toBe(2); // Verifica que hay 2 ítems en el menú
  });

  // Prueba 6: Verificar que el overlay tiene la clase active cuando el sidebar está abierto
  it('debería tener la clase active en el overlay cuando el sidebar está abierto', () => {
    component.isOpen = true; // Abre el sidebar
    fixture.detectChanges();

    const overlayElement = fixture.nativeElement.querySelector('.sidebar-overlay');
    expect(overlayElement.classList.contains('active')).toBe(true); // Verifica que tiene la clase 'active'
  });
});