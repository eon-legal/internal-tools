import { Component, ViewContainerRef, Type, ViewChild } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CommonModule } from '@angular/common';
import { ButtonGenericComponent } from '../button-generic/button-generic.component';
import {
  ButtonGenericInterface,
  ModalConfig,
} from '../button-generic/interfaces/buttons';

@Component({
  selector: 'app-app-modal-container',
  standalone: true,
  imports: [CommonModule, ButtonGenericComponent],
  templateUrl: './app-modal-container.component.html',
  styleUrl: './app-modal-container.component.scss',
})
export class AppModalContainerComponent {
  @ViewChild('componentContainer', { read: ViewContainerRef })
  componentHost!: ViewContainerRef;

  component!: Type<any>;
  config!: ModalConfig;
  buttonsConfig!: ButtonGenericInterface;

  constructor(private dialogConfig: DynamicDialogConfig) {}

  ngOnInit(): void {
    this.component = this.dialogConfig.data.component;
    this.config = this.dialogConfig.data.config || {};
    this.buttonsConfig = this.config?.buttons || {};
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
