import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagesToPdfComponent } from './images-to-pdf.component';

describe('ImagesToPdfComponent', () => {
  let component: ImagesToPdfComponent;
  let fixture: ComponentFixture<ImagesToPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImagesToPdfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImagesToPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
