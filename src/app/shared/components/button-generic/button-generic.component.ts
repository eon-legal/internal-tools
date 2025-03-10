import { Component, inject, Input, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { NgClass } from '@angular/common';
import { ButtonConfig, ButtonGenericInterface } from '../../interfaces/buttons';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-button-generic',
  standalone: true,
  imports: [ButtonModule, NgClass],
  templateUrl: './button-generic.component.html',
  styleUrl: './button-generic.component.scss',
})
export class ButtonGenericComponent implements OnInit {
  @Input() buttons: ButtonGenericInterface;
  showHideButton(button: ButtonConfig): boolean {
    if (
      'hideDependsFunction' in button &&
      typeof button?.hideDependsFunction === 'function'
    ) {
      return button?.hideDependsFunction() ? false : true;
    }
    return true;
  }
  languageService: LanguageService = inject(LanguageService);

  ngOnInit() {
    // Suscribirse a cambios de idioma
    this.languageService.getLanguageObservable().subscribe(() => {
      // Actualizar las etiquetas de los botones
    });
  }

  // Obtiene el texto traducido
  getButtonLabel(label: string): string {
    return this.languageService.getText(label);
  }
}
