import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainInvoicesComponent } from './contain-invoices.component';

describe('ContainInvoicesComponent', () => {
  let component: ContainInvoicesComponent;
  let fixture: ComponentFixture<ContainInvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainInvoicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContainInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
