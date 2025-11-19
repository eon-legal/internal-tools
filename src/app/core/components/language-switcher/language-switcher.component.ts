import { Component, inject } from '@angular/core';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../shared/services/language/language.service';

/**
 * LanguageSwitcherComponent provides a UI control to switch between
 * available languages (English and Spanish).
 * 
 * This component uses PrimeNG's SelectButton for a clean toggle interface.
 */
@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [SelectButtonModule, FormsModule],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss',
})
export class LanguageSwitcherComponent {
  private readonly languageService = inject(LanguageService);

  /** Available language options */
  languageOptions = [
    { label: 'ES', value: 'es', icon: 'pi pi-flag' },
    { label: 'EN', value: 'en', icon: 'pi pi-flag' },
  ];

  /** Currently selected language */
  selectedLanguage: string = this.languageService.getCurrentLanguage();

  /**
   * Handle language change event.
   * Updates the application language when user selects a different option.
   */
  onLanguageChange(): void {
    this.languageService.setLanguage(this.selectedLanguage);
  }
}

