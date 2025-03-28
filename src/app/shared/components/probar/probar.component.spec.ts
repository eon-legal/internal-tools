import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbarComponent } from './probar.component';

describe('ProbarComponent', () => {
  let component: ProbarComponent;
  let fixture: ComponentFixture<ProbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
