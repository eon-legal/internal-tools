import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

/**
 * LanguageService wraps Angular's TranslateService to provide
 * a simplified API for internationalization across the application.
 * 
 * This service provides methods to:
 * - Get translated text synchronously and asynchronously
 * - Switch between languages
 * - Get the current language
 * - Get available languages
 */
@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly translate = inject(TranslateService);

  constructor() {
    // Set default language to Spanish
    this.translate.setDefaultLang('es');
    
    // Try to use browser language if available, otherwise use Spanish
    const browserLang = this.translate.getBrowserLang();
    const langToUse = browserLang?.match(/en|es/) ? browserLang : 'es';
    this.translate.use(langToUse);
  }

  /**
   * Get translated text synchronously.
   * Use this method when you need the translation immediately in TypeScript code.
   * 
   * @param key - Translation key (e.g., 'common.buttons.save')
   * @param params - Optional interpolation parameters
   * @returns Translated string
   * 
   * @example
   * const saveLabel = this.languageService.getText('common.buttons.save');
   * const greeting = this.languageService.getText('common.greeting', { name: 'John' });
   */
  getText(key: string, params?: object): string {
    return this.translate.instant(key, params);
  }

  /**
   * Get translated text asynchronously.
   * Use this method when you need to wait for translations to load.
   * 
   * @param key - Translation key (e.g., 'common.buttons.save')
   * @param params - Optional interpolation parameters
   * @returns Observable of translated string
   * 
   * @example
   * this.languageService.getTextAsync('common.buttons.save').subscribe(text => {
   *   console.log(text);
   * });
   */
  getTextAsync(key: string, params?: object): Observable<string> {
    return this.translate.get(key, params);
  }

  /**
   * Get multiple translations at once asynchronously.
   * 
   * @param keys - Array of translation keys
   * @param params - Optional interpolation parameters
   * @returns Observable of object with translations
   * 
   * @example
   * this.languageService.getTextsAsync(['common.buttons.save', 'common.buttons.cancel'])
   *   .subscribe(translations => {
   *     console.log(translations['common.buttons.save']);
   *   });
   */
  getTextsAsync(keys: string[], params?: object): Observable<Record<string, string>> {
    return this.translate.get(keys, params);
  }

  /**
   * Change the current language.
   * 
   * @param lang - Language code ('en' or 'es')
   * 
   * @example
   * this.languageService.setLanguage('en');
   */
  setLanguage(lang: string): void {
    this.translate.use(lang);
  }

  /**
   * Get the current active language.
   * 
   * @returns Current language code
   * 
   * @example
   * const currentLang = this.languageService.getCurrentLanguage(); // 'es' or 'en'
   */
  getCurrentLanguage(): string {
    return this.translate.currentLang || this.translate.defaultLang || 'es';
  }

  /**
   * Get all available languages.
   * 
   * @returns Array of available language codes
   * 
   * @example
   * const langs = this.languageService.getAvailableLanguages(); // ['en', 'es']
   */
  getAvailableLanguages(): string[] {
    return this.translate.getLangs();
  }

  /**
   * Stream of language change events.
   * Subscribe to this to react to language changes.
   * 
   * @returns Observable that emits when language changes
   * 
   * @example
   * this.languageService.onLanguageChange().subscribe(event => {
   *   console.log('Language changed to:', event.lang);
   * });
   */
  onLanguageChange(): Observable<{ lang: string; translations: unknown }> {
    return this.translate.onLangChange;
  }
}

