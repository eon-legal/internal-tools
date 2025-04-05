import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
//import { DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  ButtonConfig,
  ButtonGenericInterface,
} from '../button-generic/interfaces/buttons';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { ButtonGenericComponent } from '../button-generic/button-generic.component';
@Component({
  selector: 'app-generic-modal',
  standalone: true,
  imports: [ButtonGenericComponent],
  templateUrl: './generic-modal.component.html',
  styleUrl: './generic-modal.component.scss',
})
export class GenericModalComponent implements OnInit, OnDestroy {
  @ViewChild('contentContainer', { read: ViewContainerRef, static: true })
  contentContainer!: ViewContainerRef;

  buttonsConfig: ButtonGenericInterface = {};
  data: any;
  private subscriptions: Subscription[] = [];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.validateInput();
    this.buttonsConfig = this.config.data?.buttonsConfig || {};
    this.data = this.config.data?.data;
    this.loadContent();
  }

  ngOnDestroy(): void {
    this.cleanupSubscriptions();
  }

  private validateInput(): void {
    if (!this.config.data?.content) {
      console.error(
        'GenericModalComponent: No se proporcionó contenido para el modal'
      );
    }
  }

  private loadContent(): void {
    try {
      const content = this.config.data?.content;

      if (this.isComponent(content)) {
        this.loadComponent(content);
      } else if (this.isTemplate(content)) {
        this.loadTemplate(content);
      } else {
        console.error('Tipo de contenido no soportado:', content);
      }
    } catch (error) {
      console.error('Error al cargar el contenido:', error);
    }
  }

  private isComponent(content: any): content is Type<any> {
    return typeof content === 'function';
  }

  private isTemplate(content: any): content is TemplateRef<any> {
    return content?.createEmbeddedView !== undefined;
  }

  private loadComponent(component: Type<any>): void {
    this.contentContainer.clear();
    const componentRef = this.contentContainer.createComponent(component);

    if (this.data) {
      Object.assign(componentRef.instance, this.data);

      if (componentRef.instance['onAction']) {
        const sub = componentRef.instance['onAction'].subscribe(
          (event: any) => {
            this.handleChildEvent(event);
          }
        );
        this.subscriptions.push(sub);
      }
    }
  }

  private loadTemplate(template: TemplateRef<any>): void {
    this.contentContainer.clear();
    this.contentContainer.createEmbeddedView(template, {
      $implicit: this.data,
      data: this.data,
      parent: this,
    });
  }

  private handleChildEvent(event: any): void {
    console.log('Evento del componente hijo:', event);
  }

  private cleanupSubscriptions(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  closeModal(result?: any): void {
    this.ref.close(result);
  }
}
