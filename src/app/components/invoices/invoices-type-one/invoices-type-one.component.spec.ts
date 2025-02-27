import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicesTypeOneComponent } from './invoices-type-one.component';

describe('InvoicesTypeOneComponent', () => {
  let component: InvoicesTypeOneComponent;
  let fixture: ComponentFixture<InvoicesTypeOneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoicesTypeOneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoicesTypeOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
