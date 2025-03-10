import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
 /**
  * constructor(public languageService: LanguageService) {}

  // Cambia el idioma
  changeLanguage(language: string) {
    this.languageService.setLanguage(language);
  }
  */
}
