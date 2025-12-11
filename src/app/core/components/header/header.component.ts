import {
  Component,
  EventEmitter,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TooltipModule } from 'primeng/tooltip';
import { ToastrService } from 'ngx-toastr';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { AuthService } from '../../../data-access/auth/auth.service';
import { LanguageService } from '../../../shared/services/language/language.service';

/**
 * HeaderComponent is a reusable component that represents the header of the application.
 * It provides functionality to toggle the menu state, switch languages, and manage authentication.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    SplitButtonModule,
    TooltipModule,
    LanguageSwitcherComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  readonly authService = inject(AuthService);
  private readonly languageService = inject(LanguageService);

  /**
   * Output property to emit an event when the menu is toggled.
   * This event can be used by parent components to handle the menu state.
   * @type {EventEmitter<void>}
   */
  @Output() toggleMenu = new EventEmitter<void>();

  /**
   * Get translated text
   */
  getText(key: string): string {
    return this.languageService.getText(key);
  }

  /**
   * Handle user logout
   */
  async logout(): Promise<void> {
    const result = await this.authService.signOut();

    if (result.success) {
      this.toastr.success(
        this.getText('auth.messages.logout_success'),
        this.getText('common.labels.success')
      );
      this.router.navigate(['/login']);
    } else {
      this.toastr.error(
        this.getText(result.error ?? 'auth.errors.unknown'),
        this.getText('common.labels.error')
      );
    }
  }
}
