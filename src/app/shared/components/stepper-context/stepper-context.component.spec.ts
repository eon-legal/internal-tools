/*import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepperContextComponent } from './stepper-context.component';
import { Stepper, StepperModule } from 'primeng/stepper';
import { ButtonGenericComponent } from '../button-generic/button-generic.component';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('StepperContextComponent', () => {
  let component: StepperContextComponent;
  let fixture: ComponentFixture<StepperContextComponent>;

  const mockStepper = {
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
      imports: [
        NoopAnimationsModule,
        StepperModule, 
        CommonModule, 
        StepperContextComponent, 
        ButtonGenericComponent,
        Stepper
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StepperContextComponent);
    component = fixture.componentInstance;
    component.stepper = mockStepper;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('getArrayButtons()', () => {
    it('should return correct buttons for step 1', () => {
      component.index = 1;
      const buttons = component.getArrayButtons() || [];
      
      expect(buttons.length).toBe(2);
      
      const firstButton = buttons[0];
      const secondButton = buttons[1];
      expect(firstButton.id).toBe(1);
      expect(secondButton.id).toBe(2);
    });

    it('should return correct buttons for step 2', () => {
      component.index = 2;
      const buttons = component.getArrayButtons() || [];
      
      expect(buttons.length).toBe(2);
      expect(buttons[0].id).toBe(3);
      expect(buttons[1].id).toBe(4);
    });

    it('should return correct buttons for step 3', () => {
      component.index = 3;
      const buttons = component.getArrayButtons() || [];
      
      expect(buttons.length).toBe(2);
      expect(buttons[0].id).toBe(5);
      expect(buttons[1].id).toBe(6);
    });

    it('should return empty array for invalid step index', () => {
      component.index = 4;
      const buttons = component.getArrayButtons() || [];
      expect(buttons.length).toBe(0);
    });

    it('should return empty array when no buttons configuration', () => {
      component.stepper = { buttons: [] };
      component.index = 1;
      const buttons = component.getArrayButtons() || [];
      expect(buttons.length).toBe(0);
    });

    it('should return empty array when stepper is undefined', () => {
      component.stepper = undefined as any;
      component.index = 1;
      const buttons = component.getArrayButtons() || [];
      expect(buttons.length).toBe(0);
    });
  });
});*/