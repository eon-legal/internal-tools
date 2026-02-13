/**
 * Login Component
 *
 * Responsibilities:
 * - Provide login form UI with email and password fields
 * - Handle form validation with inline field-level error messages
 * - Submit credentials to AuthService
 * - Display persistent inline error banner for server-side errors
 * - Track failed login attempts and enforce client-side lockout (5 attempts → 30s cooldown)
 * - Clear error state on user interaction
 * - Navigate to app after successful login
 *
 * Dependencies:
 * - AuthService for authentication
 * - LanguageService for i18n
 * - ToastrService for success notifications
 * - Router for navigation
 */

import { Component, DestroyRef, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxTurnstileModule } from 'ngx-turnstile';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';

import { AuthService } from '../../../../data-access/auth/auth.service';
import { LanguageService } from '../../../../shared/services/language/language.service';
import { LanguageSwitcherComponent } from '../../../../core/components/language-switcher/language-switcher.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule,
    CheckboxModule,
    MessageModule,
    NgxTurnstileModule,
    LanguageSwitcherComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly languageService = inject(LanguageService);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  /** localStorage key for the remembered email */
  private readonly REMEMBER_EMAIL_KEY = 'rememberedEmail';

  /** Max failed attempts before temporary lockout */
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  /** Lockout duration in milliseconds (30 seconds) */
  private readonly LOCKOUT_DURATION_MS = 30_000;

  /** Whether registration is enabled */
  readonly isRegistrationEnabled = this.authService.isRegistrationEnabled;

  /** Environment config exposed for template (CAPTCHA settings) */
  readonly environment = environment;

  /** CAPTCHA token received from Cloudflare Turnstile widget */
  readonly captchaToken = signal<string>('');

  /** Loading state */
  readonly isLoading = signal(false);

  /** Inline error message displayed in the form (persistent until cleared) */
  readonly loginError = signal<string>('');

  /** Number of consecutive failed login attempts */
  private readonly failedAttempts = signal(0);

  /** Timestamp when lockout expires (0 = not locked) */
  private readonly lockedUntil = signal(0);

  /** Lockout countdown timer handle */
  private lockoutTimerId: ReturnType<typeof setInterval> | null = null;

  /** Remaining lockout seconds for display */
  readonly lockoutSeconds = signal(0);

  /** Whether the user is currently locked out */
  readonly isLockedOut = computed(() => this.lockoutSeconds() > 0);

  /** Login form */
  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  ngOnInit(): void {
    const savedEmail = localStorage.getItem(this.REMEMBER_EMAIL_KEY);
    if (savedEmail) {
      this.loginForm.patchValue({ email: savedEmail, rememberMe: true });
    }

    // Clear inline error when user modifies any form field
    this.loginForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.loginError()) {
          this.loginError.set('');
        }
      });
  }

  /**
   * Get translated text
   */
  getText(key: string): string {
    return this.languageService.getText(key);
  }

  /**
   * Handle form submission
   */
  async onSubmit(): Promise<void> {
    // Block submission if locked out
    if (this.isLockedOut()) {
      return;
    }

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loginError.set('');
    this.isLoading.set(true);

    // Require CAPTCHA token when enabled (production)
    if (this.environment.captcha.enabled && !this.captchaToken()) {
      this.loginError.set(this.getText('auth.errors.captcha_required'));
      return;
    }

    const result = await this.authService.signIn({
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      captchaToken: this.captchaToken() || undefined,
    });

    this.isLoading.set(false);

    if (result.success) {
      // Reset attempt counter on success
      this.failedAttempts.set(0);

      // Persist or clear the remembered email based on checkbox state
      if (this.loginForm.value.rememberMe) {
        localStorage.setItem(this.REMEMBER_EMAIL_KEY, this.loginForm.value.email);
      } else {
        localStorage.removeItem(this.REMEMBER_EMAIL_KEY);
      }

      this.toastr.success(
        this.getText('auth.messages.login_success'),
        this.getText('common.labels.success')
      );
      // Navigate to the intended destination or default to home
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
      this.router.navigateByUrl(returnUrl);
    } else {
      // Reset CAPTCHA token so user must re-verify on retry
      this.captchaToken.set('');
      this.handleLoginFailure(result.error);
    }
  }

  /**
   * Handle a failed login attempt: set inline error, track attempts, trigger lockout if needed
   */
  private handleLoginFailure(errorKey?: string): void {
    const attempts = this.failedAttempts() + 1;
    this.failedAttempts.set(attempts);

    const translatedError = this.getText(errorKey ?? 'auth.errors.unknown');

    if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
      this.startLockout();
      return;
    }

    // Show remaining attempts warning after 3+ failures
    const remaining = this.MAX_LOGIN_ATTEMPTS - attempts;
    if (attempts >= 3) {
      const warningText = this.getText('auth.login_errors.attempts_remaining')
        .replace('{{count}}', remaining.toString());
      this.loginError.set(`${translatedError} ${warningText}`);
    } else {
      this.loginError.set(translatedError);
    }
  }

  /**
   * Start the lockout timer after max failed attempts
   */
  private startLockout(): void {
    const until = Date.now() + this.LOCKOUT_DURATION_MS;
    this.lockedUntil.set(until);
    this.updateLockoutSeconds();

    this.lockoutTimerId = setInterval(() => {
      this.updateLockoutSeconds();
      if (this.lockoutSeconds() <= 0) {
        this.clearLockout();
      }
    }, 1000);

    const lockoutMsg = this.getText('auth.login_errors.account_locked')
      .replace('{{seconds}}', Math.ceil(this.LOCKOUT_DURATION_MS / 1000).toString());
    this.loginError.set(lockoutMsg);
  }

  /**
   * Update the lockout countdown display
   */
  private updateLockoutSeconds(): void {
    const remaining = Math.max(0, Math.ceil((this.lockedUntil() - Date.now()) / 1000));
    this.lockoutSeconds.set(remaining);

    // Update the displayed message with current countdown
    if (remaining > 0) {
      const lockoutMsg = this.getText('auth.login_errors.account_locked')
        .replace('{{seconds}}', remaining.toString());
      this.loginError.set(lockoutMsg);
    }
  }

  /**
   * Clear the lockout state and reset attempt counter
   */
  private clearLockout(): void {
    if (this.lockoutTimerId) {
      clearInterval(this.lockoutTimerId);
      this.lockoutTimerId = null;
    }
    this.lockedUntil.set(0);
    this.lockoutSeconds.set(0);
    this.failedAttempts.set(0);
    this.loginError.set('');
  }

  /**
   * Check if a form field has an error
   */
  hasError(field: string, error: string): boolean {
    const control = this.loginForm.get(field);
    return !!control && control.hasError(error) && control.touched;
  }
}

