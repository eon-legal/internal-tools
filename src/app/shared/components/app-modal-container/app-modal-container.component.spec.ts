import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppModalContainerComponent } from './app-modal-container.component';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

describe('AppModalContainerComponent', () => {
  let component: AppModalContainerComponent;
  let fixture: ComponentFixture<AppModalContainerComponent>;
  let mockDialogConfig: Partial<DynamicDialogConfig>;

  beforeEach(async () => {
    mockDialogConfig = {
      data: {},
    };
    await TestBed.configureTestingModule({
      imports: [AppModalContainerComponent],
      providers: [{ provide: DynamicDialogConfig, useValue: mockDialogConfig }],
    }).compileComponents();

    fixture = TestBed.createComponent(AppModalContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
