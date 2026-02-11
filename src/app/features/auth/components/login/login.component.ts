/**
 * Login Component
 *
 * Responsibilities:
 * - Provide login form UI with email and password fields
 * - Handle form validation
 * - Submit credentials to AuthService
 * - Display success/error notifications
 * - Navigate to app after successful login
 *
 * Dependencies:
 * - AuthService for authentication
 * - LanguageService for i18n
 * - ToastrService for notifications
 * - Router for navigation
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';

import { AuthService } from '../../../../data-access/auth/auth.service';
import { LanguageService } from '../../../../shared/services/language/language.service';
import { LanguageSwitcherComponent } from '../../../../core/components/language-switcher/language-switcher.component';

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

  /** localStorage key for the remembered email */
  private readonly REMEMBER_EMAIL_KEY = 'rememberedEmail';

  /** Whether registration is enabled */
  readonly isRegistrationEnabled = this.authService.isRegistrationEnabled;

  /** Loading state */
  readonly isLoading = signal(false);

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
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const result = await this.authService.signIn({
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    });

    this.isLoading.set(false);

    if (result.success) {
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
      this.toastr.error(
        this.getText(result.error ?? 'auth.errors.unknown'),
        this.getText('common.labels.error')
      );
    }
  }

  /**
   * Check if a form field has an error
   */
  hasError(field: string, error: string): boolean {
    const control = this.loginForm.get(field);
    return !!control && control.hasError(error) && control.touched;
  }
}

