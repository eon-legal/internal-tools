import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [LanguageService],
    });
    service = TestBed.inject(LanguageService);
    translateService = TestBed.inject(TranslateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set default language to Spanish', () => {
    expect(translateService.defaultLang).toBe('es');
  });

  it('should get text synchronously', () => {
    translateService.setTranslation('es', {
      test: { key: 'Hola' },
    });
    translateService.use('es');

    const text = service.getText('test.key');
    expect(text).toBe('Hola');
  });

  it('should get text with parameters', () => {
    translateService.setTranslation('es', {
      test: { greeting: 'Hola {{name}}' },
    });
    translateService.use('es');

    const text = service.getText('test.greeting', { name: 'Juan' });
    expect(text).toBe('Hola Juan');
  });

  it('should change language', () => {
    service.setLanguage('en');
    expect(translateService.currentLang).toBe('en');
  });

  it('should get current language', () => {
    translateService.use('en');
    expect(service.getCurrentLanguage()).toBe('en');
  });

  it('should get text asynchronously', (done) => {
    translateService.setTranslation('es', {
      test: { async: 'Texto asíncrono' },
    });
    translateService.use('es');

    service.getTextAsync('test.async').subscribe((text) => {
      expect(text).toBe('Texto asíncrono');
      done();
    });
  });

  it('should get multiple texts asynchronously', (done) => {
    translateService.setTranslation('es', {
      test: {
        key1: 'Texto 1',
        key2: 'Texto 2',
      },
    });
    translateService.use('es');

    service.getTextsAsync(['test.key1', 'test.key2']).subscribe((texts) => {
      expect(texts['test.key1']).toBe('Texto 1');
      expect(texts['test.key2']).toBe('Texto 2');
      done();
    });
  });
});

