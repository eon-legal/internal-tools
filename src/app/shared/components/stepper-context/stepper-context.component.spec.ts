import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepperContextComponent } from './stepper-context.component';
import { Stepper, StepperModule } from 'primeng/stepper';
import { ButtonGenericInterface } from '../button-generic/interfaces/buttons';
import { By } from '@angular/platform-browser';

describe('StepperContextComponent', () => {
  let component: StepperContextComponent;
  let fixture: ComponentFixture<StepperContextComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StepperModule,
        StepperContextComponent,
      ],
      providers: [{ provide: Stepper, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(StepperContextComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change value index to 2', () => {
    component.index = 2;
    expect(component.index).toBeGreaterThan(1);
  });

  it('should verify array stepperButtons', () => {
    const mockStepperConfig: ButtonGenericInterface = {
      buttons: [
        { id: 1, label: 'Button 1' },
        { id: 2, label: 'Button 2' },
        { id: 3, label: 'Button 3' },
        { id: 4, label: 'Button 4' },
        { id: 5, label: 'Button 5' },
        { id: 6, label: 'Button 6' },
      ],
    };
    component.stepperButtons = mockStepperConfig;
    const getButtons = component.stepperButtons?.buttons;
    expect(getButtons).toBeDefined();
    expect(getButtons?.length).toBe(6);
  });
  it('should render with basic structure', () => {
    const panel = fixture.nativeElement.querySelector('p-step-panel');
    expect(panel).toBeTruthy();
  });
});
