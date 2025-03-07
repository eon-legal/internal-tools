import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicesDestinationFormComponent } from './invoices-destination-form.component';

describe('InvoicesDestinationFormComponent', () => {
  let component: InvoicesDestinationFormComponent;
  let fixture: ComponentFixture<InvoicesDestinationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoicesDestinationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoicesDestinationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
