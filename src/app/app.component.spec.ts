import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterOutlet } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterOutlet], // Importamos el componente y RouterOutlet
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Detectar cambios para renderizar la plantilla
  });

  it('should create the component', () => {
    expect(component).toBeTruthy(); // Verificar que el componente se ha creado correctamente
  });

  it('should contain a router-outlet', () => {
    const routerOutletElement = fixture.nativeElement.querySelector('router-outlet'); // Buscar el elemento <router-outlet>
    expect(routerOutletElement).toBeTruthy(); // Verificar que el elemento existe
  });
});