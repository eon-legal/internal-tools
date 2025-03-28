import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessagesComponent } from './messages.component';
import { MessageModule } from 'primeng/message';
import { Stepper } from 'primeng/stepper';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
describe('MessagesComponent', () => {
  let component: MessagesComponent;
  let fixture: ComponentFixture<MessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageModule, MessagesComponent, Stepper, NoopAnimationsModule], // Importa el módulo de PrimeNG necesario
    }).compileComponents();

    fixture = TestBed.createComponent(MessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Prueba 1: Verificar que el componente se crea correctamente
  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  // Prueba 2: Verificar que el mensaje de error se muestra correctamente
  it('debería mostrar el mensaje de error cuando se proporciona', () => {
    const errorMessage = 'Este es un mensaje de error';
    component.errorMessage = errorMessage;
    fixture.detectChanges(); // Actualiza la vista con el nuevo valor

    const messageElement = fixture.nativeElement.querySelector(
      '.error-message .message-content'
    );
    expect(messageElement).toBeTruthy(); // Verifica que el elemento existe
    expect(messageElement.innerHTML).toContain(errorMessage); // Verifica que el mensaje sea correcto
  });

  // Prueba 3: Verificar que no se muestra ningún mensaje si errorMessage está vacío
it('no debería mostrar ningún mensaje si errorMessage está vacío', () => {
  component.errorMessage = '';
  fixture.detectChanges();

  const messageElement = fixture.nativeElement.querySelector(
    '.error-message .message-content'
  );
  // Either check for empty content
  expect(messageElement.textContent?.trim()).toBeFalsy();
  
  // Or alternatively check if the p-message has ng-star-inserted class (hidden state)
  // const pMessage = fixture.nativeElement.querySelector('p-message');
  // expect(pMessage).not.toHaveClass('ng-star-inserted');
});

  // Prueba 4: Verificar que el mensaje de error con HTML se renderiza correctamente
  it('debería renderizar HTML en el mensaje de error si se proporciona', () => {
    const errorMessage =
      '<strong>Error:</strong> Este es un mensaje de error con HTML';
    component.errorMessage = errorMessage;
    fixture.detectChanges();

    const messageElement = fixture.nativeElement.querySelector(
      '.error-message .message-content'
    );
    expect(messageElement.innerHTML).toContain('<strong>Error:</strong>'); // Verifica que el HTML se renderiza
  });

  // Prueba 5: Verificar que el componente tiene las clases CSS correctas
  it('debería tener las clases CSS correctas', () => {
    component.errorMessage = 'Mensaje de error';
    fixture.detectChanges();

    const messageContainer =
      fixture.nativeElement.querySelector('.error-message');
    expect(messageContainer.classList.contains('error-message')).toBeTruthy(); // Verifica la clase 'error-message'
    expect(messageContainer.classList.contains('my-4')).toBeTruthy(); // Verifica la clase 'my-4'
  });
});
