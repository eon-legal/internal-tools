/**
 * Register Component
 *
 * Responsibilities:
 * - Provide registration form UI with email, password, and confirm password fields
 * - Handle form validation including password matching
 * - Submit credentials to AuthService
 * - Display success/error notifications
 * - Redirect to login after successful registration
 * - Guard: Only accessible when registrationEnabled is true
 *
 * Dependencies:
 * - AuthService for authentication
 * - LanguageService for i18n
 * - ToastrService for notifications
 * - Router for navigation
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import { AuthService } from '../../../../data-access/auth/auth.service';
import { LanguageService } from '../../../../shared/services/language/language.service';
import { LanguageSwitcherComponent } from '../../../../core/components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule,
    LanguageSwitcherComponent,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly languageService = inject(LanguageService);
  private readonly toastr = inject(ToastrService);

  /** Loading state */
  readonly isLoading = signal(false);

  /** Registration form */
  readonly registerForm: FormGroup = this.fb.group(
    {
      displayName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordsMatchValidator }
  );

  ngOnInit(): void {
    // Redirect if registration is disabled
    if (!this.authService.isRegistrationEnabled) {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Custom validator to check if passwords match
   */
  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
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
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const result = await this.authService.signUp({
      displayName: this.registerForm.value.displayName || undefined,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
    });

    this.isLoading.set(false);

    if (result.success) {
      // Check if email confirmation is needed
      if (result.error === 'auth.messages.check_email_confirmation') {
        this.toastr.info(
          this.getText('auth.messages.check_email_confirmation'),
          this.getText('common.labels.success')
        );
      } else {
        this.toastr.success(
          this.getText('auth.messages.register_success'),
          this.getText('common.labels.success')
        );
      }
      this.router.navigate(['/login']);
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
    const control = this.registerForm.get(field);
    return !!control && control.hasError(error) && control.touched;
  }
}

