import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepperContextComponent } from './stepper-context.component';
import { Stepper, StepperModule } from 'primeng/stepper';
import { CommonModule } from '@angular/common';

describe('StepperContextComponent', () => {
  let component: StepperContextComponent;
  let fixture: ComponentFixture<StepperContextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepperContextComponent, StepperModule, CommonModule],
      //providers: [{provide: Stepper}]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepperContextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});