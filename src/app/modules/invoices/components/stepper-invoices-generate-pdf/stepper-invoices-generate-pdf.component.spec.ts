import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepperInvoicesGeneratePdfComponent } from './stepper-invoices-generate-pdf.component';

describe('StepperInvoicesGeneratePdfComponent', () => {
  let component: StepperInvoicesGeneratePdfComponent;
  let fixture: ComponentFixture<StepperInvoicesGeneratePdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepperInvoicesGeneratePdfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepperInvoicesGeneratePdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
