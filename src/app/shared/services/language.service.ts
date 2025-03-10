import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private currentLanguage = new BehaviorSubject< 'es' | 'en'>('es'); // Idioma por defecto
  private translations: { [key: string]: any } = {};

  constructor(private http: HttpClient) {
    this.loadTranslations('es'); // Cargar traducciones por defecto
  }

  // Cambia el idioma y carga las traducciones
  setLanguage(language: 'es' | 'en') {
    this.currentLanguage.next(language);
    this.loadTranslations(language);
  }

  // Obtiene el texto traducido
  getText(key: string): string {
    return this.translations[key] || key;
  }

  // Carga las traducciones desde el archivo JSON
  private loadTranslations(language: string) {
    this.http.get(`/assets/i18n/${language}.json`).subscribe((data) => {
      this.translations = data;
    });
  }

  // Observable para escuchar cambios de idioma
  getLanguageObservable(): Observable<string> {
    return this.currentLanguage.asObservable();
  }
}
