import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideToastr } from 'ngx-toastr';
import { DialogService } from 'primeng/dynamicdialog';

import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';

import { environment } from '../environments/environment';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

/**
 * Factory function to create the TranslateHttpLoader.
 * This loader fetches translation files from the assets/i18n directory.
 */
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

/**
 * Factory function to initialize translations before app starts.
 * This ensures all translation files are loaded before components render.
 *
 * @param translate - TranslateService instance
 * @returns Promise that resolves when translations are loaded
 */
export function initializeTranslations(translate: TranslateService) {
  return (): Promise<void> => {
    // Set default language
    translate.setDefaultLang('es');

    // Determine which language to use
    const savedLang = localStorage.getItem('selectedLanguage');
    const browserLang = translate.getBrowserLang();
    const langToUse = savedLang || (browserLang?.match(/en|es/) ? browserLang : 'es');

    // Load the translation file and wait for it to complete
    return translate.use(langToUse).toPromise().then(() => {
      console.log(`Translations loaded for language: ${langToUse}`);
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideToastr({ timeOut: 2000, preventDuplicates: true }),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]), withInterceptorsFromDi()),
    DialogService,
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
    // Configure i18n with TranslateModule
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
    // Initialize translations before app starts
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTranslations,
      deps: [TranslateService],
      multi: true,
    },
  ],
};
