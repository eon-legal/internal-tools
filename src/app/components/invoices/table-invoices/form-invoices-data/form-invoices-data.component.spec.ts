import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInvoicesDataComponent } from './form-invoices-data.component';

describe('FormInvoicesDataComponent', () => {
  let component: FormInvoicesDataComponent;
  let fixture: ComponentFixture<FormInvoicesDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormInvoicesDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormInvoicesDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
