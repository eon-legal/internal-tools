import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { ButtonModule } from 'primeng/button';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../data-access/auth/auth.service';
import { LanguageService } from '../../../shared/services/language/language.service';
import { Router } from '@angular/router';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        ButtonModule,
        SplitButtonModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: ToastrService, useValue: { success: jest.fn(), error: jest.fn() } },
        { provide: AuthService, useValue: { signOut: jest.fn().mockResolvedValue({ success: true }), isAuthenticated: jest.fn().mockReturnValue(false), userProfile: jest.fn().mockReturnValue(null) } },
        { provide: LanguageService, useValue: { getText: jest.fn((key: string) => key), getCurrentLanguage: jest.fn().mockReturnValue('es'), onLanguageChange: jest.fn() } },
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Prueba 1: Verificar que el componente se crea correctamente
  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  // Prueba 2: Verificar que el botón del menú está presente
  it('debería tener un botón para abrir/cerrar el menú', () => {
    const buttonElement = fixture.nativeElement.querySelector('.mobile-menu-btn');
    expect(buttonElement).toBeTruthy(); // Verifica que el botón existe
    expect(buttonElement.querySelector('.pi-bars')).toBeTruthy(); // Verifica que el ícono está presente
  });

  // Prueba 3: Verificar que el evento toggleMenu se emite al hacer clic en el botón
  it('debería emitir el evento toggleMenu al hacer clic en el botón', () => {
    jest.spyOn(component.toggleMenu, 'emit'); // Espía el método emit del EventEmitter

    const buttonElement = fixture.nativeElement.querySelector('.mobile-menu-btn');
    buttonElement.click(); // Simula un clic en el botón

    expect(component.toggleMenu.emit).toHaveBeenCalled(); // Verifica que el evento se emitió
  });

  // Prueba 4: Verificar que el logo está presente
  it('debería mostrar el logo de la aplicación', () => {
    const logoElement = fixture.nativeElement.querySelector('.logo');
    expect(logoElement).toBeTruthy(); // Verifica que el logo existe
    expect(logoElement.textContent).toContain('DocPro'); // Verifica que el texto del logo es correcto
  });

  // Prueba 5: Verificar que el botón tiene la clase CSS correcta
  it('debería tener la clase CSS "mobile-menu-btn" en el botón', () => {
    const buttonElement = fixture.nativeElement.querySelector('.mobile-menu-btn');
    expect(buttonElement.classList.contains('mobile-menu-btn')).toBeTruthy(); // Verifica la clase CSS
  });
});