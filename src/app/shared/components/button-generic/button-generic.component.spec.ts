import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonGenericComponent } from './button-generic.component';
import { ButtonModule } from 'primeng/button';
import { NgClass } from '@angular/common';
import { ButtonGenericInterface, ButtonConfig } from './interfaces/buttons';
import { TranslateModule } from '@ngx-translate/core';

describe('ButtonGenericComponent', () => {
  let component: ButtonGenericComponent;
  let fixture: ComponentFixture<ButtonGenericComponent>;

  const defaultButtonsConfig: ButtonGenericInterface = {
    css: 'flex justify-content-center gap-3',
    buttons: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonModule, NgClass, ButtonGenericComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonGenericComponent);
    component = fixture.componentInstance;
    // Set default buttons config before detectChanges to avoid undefined errors
    component.buttons = defaultButtonsConfig;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render buttons based on input configuration', () => {
    const buttonsConfig: ButtonGenericInterface = {
      css: 'flex justify-content-center gap-3',
      buttons: [
        {
          id: 1,
          label: 'Guardar',
          severity: 'primary',
          action: jest.fn(),
        },
        {
          id: 2,
          label: 'Cancelar',
          severity: 'secondary',
          action: jest.fn(),
          hideDependsFunction: () => true,
        },
      ],
    };

    component.buttons = buttonsConfig;
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('p-button');
    expect(buttons.length).toBe(1); // Solo un botón debe renderizarse

    // Verifica el contenido interno del botón
    const buttonLabel = buttons[0].querySelector('button').textContent.trim();
    expect(buttonLabel).toBe('Guardar');
  });

  it('should show or hide buttons based on hideDependsFunction', () => {
    const buttonConfig: ButtonConfig = {
      id: 1,
      label: 'Test Button',
      severity: 'primary',
      action: jest.fn(),
    };

    expect(component.showHideButton(buttonConfig)).toBe(true);

    buttonConfig.hideDependsFunction = () => true;
    expect(component.showHideButton(buttonConfig)).toBe(false);

    buttonConfig.hideDependsFunction = () => false;
    expect(component.showHideButton(buttonConfig)).toBe(true);
  });

  it('should call the action function when a button is clicked', () => {
    const mockAction = jest.fn();
    const buttonsConfig: ButtonGenericInterface = {
      css: 'flex justify-content-center gap-3',
      buttons: [
        {
          id: 1,
          label: 'Guardar',
          severity: 'primary',
          action: mockAction,
        },
      ],
    };

    component.buttons = buttonsConfig;
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('p-button button');
    button.click();
    expect(buttonsConfig.buttons).toBeDefined();
    expect(buttonsConfig.buttons?.length).toBeGreaterThan(0);
    expect(mockAction).toHaveBeenCalled();
  });
});
