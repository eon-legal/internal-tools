import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepperContextComponent } from './stepper-context.component';
import { Stepper, StepperModule } from 'primeng/stepper';
import { CommonModule } from '@angular/common';
import { ButtonGenericInterface } from '../button-generic/interfaces/buttons';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// Mock para p-stepper si es necesario
class MockStepper {}

describe('StepperContextComponent', () => {
  let component: StepperContextComponent;
  let fixture: ComponentFixture<StepperContextComponent>;

  const mockStepperConfig: ButtonGenericInterface = {
    buttons: [
      { id: 1, label: 'Button 1' },
      { id: 2, label: 'Button 2' },
      { id: 3, label: 'Button 3' },
      { id: 4, label: 'Button 4' },
      { id: 5, label: 'Button 5' },
      { id: 6, label: 'Button 6' }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        //Stepper,
        StepperModule, // Importa StepperModule correctamente
        StepperContextComponent // Componente standalone
      ],
      schemas: [NO_ERRORS_SCHEMA], // Ignora elementos desconocidos
      providers: [
        { provide: Stepper, useClass: MockStepper }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StepperContextComponent);
    component = fixture.componentInstance;
    
    // Configura los inputs requeridos
    component.index = 1;
    component.stepper = mockStepperConfig;
    
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ... otros tests ...
});