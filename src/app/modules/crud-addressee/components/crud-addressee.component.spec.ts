import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudAddresseeComponent } from './crud-addressee.component';

describe('CrudAddresseeComponent', () => {
  let component: CrudAddresseeComponent;
  let fixture: ComponentFixture<CrudAddresseeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudAddresseeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrudAddresseeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
