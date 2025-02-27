import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicesSenderFormComponent } from './invoices-sender-form.component';

describe('InvoicesSenderFormComponent', () => {
  let component: InvoicesSenderFormComponent;
  let fixture: ComponentFixture<InvoicesSenderFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoicesSenderFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoicesSenderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
