import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepperContextComponent } from './stepper-context.component';
import { StepperModule } from 'primeng/stepper';
import { ButtonGenericComponent } from '../button-generic/button-generic.component';
import { CommonModule } from '@angular/common';
import { ButtonGenericInterface } from '../button-generic/interfaces/buttons';

describe('StepperContextComponent', () => {
  let component: StepperContextComponent;
  let fixture: ComponentFixture<StepperContextComponent>;

  // Configuración de los botones de prueba
  const mockStepper: ButtonGenericInterface = {
    buttons: [
      { id: 1, label: 'Button 1', action: () => {} },
      { id: 2, label: 'Button 2', action: () => {} },
      { id: 3, label: 'Button 3', action: () => {} },
      { id: 4, label: 'Button 4', action: () => {} },
      { id: 5, label: 'Button 5', action: () => {} },
      { id: 6, label: 'Button 6', action: () => {} },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepperModule, CommonModule, StepperContextComponent, ButtonGenericComponent], // Importa los módulos necesarios
    }).compileComponents();

    fixture = TestBed.createComponent(StepperContextComponent);
    component = fixture.componentInstance;
    component.stepper = mockStepper; // Asigna los botones de prueba
    fixture.detectChanges();
  });

  // Prueba 1: Verificar que el componente se crea correctamente
  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  // Prueba 2: Verificar que getArrayButtons() devuelve los botones correctos para el paso 1
  it('debería devolver los botones correctos para el paso 1', () => {
    component.index = 1; // Establece el índice del paso
    const buttons = component.getArrayButtons();
    expect(buttons.length).toBe(2); // Verifica que hay 2 botones
    expect(buttons[0].id).toBe(1); // Verifica el primer botón
    expect(buttons[1].id).toBe(2); // Verifica el segundo botón
  });

  // Prueba 3: Verificar que getArrayButtons() devuelve los botones correctos para el paso 2
  it('debería devolver los botones correctos para el paso 2', () => {
    component.index = 2; // Establece el índice del paso
    const buttons = component.getArrayButtons();
    expect(buttons.length).toBe(2); // Verifica que hay 2 botones
    expect(buttons[0].id).toBe(3); // Verifica el primer botón
    expect(buttons[1].id).toBe(4); // Verifica el segundo botón
  });

  // Prueba 4: Verificar que getArrayButtons() devuelve los botones correctos para el paso 3
  it('debería devolver los botones correctos para el paso 3', () => {
    component.index = 3; // Establece el índice del paso
    const buttons = component.getArrayButtons();
    expect(buttons.length).toBe(2); // Verifica que hay 2 botones
    expect(buttons[0].id).toBe(5); // Verifica el primer botón
    expect(buttons[1].id).toBe(6); // Verifica el segundo botón
  });

  // Prueba 5: Verificar que getArrayButtons() devuelve un arreglo vacío si el índice no coincide
  it('debería devolver un arreglo vacío si el índice no coincide', () => {
    component.index = 4; // Establece un índice fuera de rango
    const buttons = component.getArrayButtons();
    expect(buttons.length).toBe(0); // Verifica que no hay botones
  });

  // Prueba 6: Verificar que getArrayButtons() devuelve un arreglo vacío si no hay configuración de botones
  it('debería devolver un arreglo vacío si no hay configuración de botones', () => {
    component.stepper = { buttons: [] }; // Establece una configuración sin botones
    component.index = 1; // Establece el índice del paso
    const buttons = component.getArrayButtons();
    expect(buttons.length).toBe(0); // Verifica que no hay botones
  });
});
