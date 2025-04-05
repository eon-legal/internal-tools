import {
  Component,
  ViewContainerRef,
  OnInit,
  OnDestroy,
  Type,
  ViewChild,
  TemplateRef,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ButtonGenericComponent } from '../../components/button-generic/button-generic.component';
import {
  ButtonGenericInterface,
  ModalConfig,
} from '../../components/button-generic/interfaces/buttons';

@Component({
  selector: 'app-modal-container',
  standalone: true,
  imports: [CommonModule, ButtonModule, ButtonGenericComponent],
  template: `
    <div #componentContainer class="modal-content"></div>

    <app-button-generic [buttons]="buttonsConfig" />
  `,
  styles: [],
})
export class ModalContainerComponent implements OnInit, AfterViewInit {
  @ViewChild('componentContainer', { read: ViewContainerRef })
  componentHost!: ViewContainerRef;

  component!: Type<any>;
  config!: ModalConfig;
  buttonsConfig!: ButtonGenericInterface;

  constructor(private dialogConfig: DynamicDialogConfig) {}

  ngOnInit(): void {
    this.component = this.dialogConfig.data.component;
    this.config = this.dialogConfig.data.config || {};
    this.buttonsConfig = {
      css: 'flex flex-column md:flex-row md:justify-content-between gap-2',
      buttons: this.config.buttons || [],
    };
  }

// modal-container.component.ts
ngAfterViewInit(): void {
  this.loadComponent();
}

loadComponent(): void {
  if (!this.component) return;

  this.componentHost.clear();
  const componentRef = this.componentHost.createComponent(this.component);

  // Asignar TODAS las propiedades de data al componente
  if (this.config.data) {
    Object.assign(componentRef.instance, this.config.data);
  }

  // Forzar la detección de cambios
  componentRef.changeDetectorRef.detectChanges();

  if (this.config.registerInstance) {
    this.config.registerInstance(componentRef.instance);
  }
}

  ngOnDestroy(): void {
    this.componentHost?.clear();
  }
}
