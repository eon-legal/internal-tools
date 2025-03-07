import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonListGenericComponent } from './button-list-generic.component';

describe('ButtonListGenericComponent', () => {
  let component: ButtonListGenericComponent;
  let fixture: ComponentFixture<ButtonListGenericComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonListGenericComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonListGenericComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
