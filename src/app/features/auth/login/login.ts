import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../../core/state/auth.store';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex-1 w-full min-h-screen flex flex-col lg:flex-row bg-canvas font-body-md text-body-md text-on-surface">
      <!-- Right Side: Clean Login Form -->
      <div class="w-full lg:w-7/12 xl:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-8 lg:py-12 bg-surface z-10">
        
        <!-- Main Login Interactive Box -->
        <div class="max-w-[420px] w-full mx-auto">
          <!-- Logo on white side -->
          <div class="mb-10 flex items-center justify-center sm:justify-start gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-[20px] shadow-sm">
              <span class="material-symbols-outlined text-[24px]">play_arrow</span>
            </div>
            <span class="font-headline-lg text-headline-sm sm:text-headline-lg font-bold text-on-surface tracking-tight">orca CRM</span>
          </div>

          <!-- Title Area -->
          <div class="mb-10 text-center sm:text-start">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300 font-label-sm text-label-sm mb-4">
              <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">admin_panel_settings</span>
              <span>نظام إدارة العمليات • orca CRM</span>
            </div>
            <h1 class="font-display text-display text-on-surface tracking-tight mb-2">تسجيل الدخول</h1>
            <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">أهلاً بك مجدداً في نظام orca CRM</p>
          </div>

          <!-- Error Alert -->
          @if (loginError()) {
            <div class="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-start gap-3">
              <span class="material-symbols-outlined text-red-500 mt-0.5">error</span>
              <p class="font-body-sm text-sm">{{ loginError() }}</p>
            </div>
          }

          <!-- Interactive Form -->
          <form class="flex flex-col gap-5" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            
            <!-- Field 1: Work Email -->
            <div class="flex flex-col gap-2">
              <label class="font-label-md text-label-md text-on-surface font-semibold" for="admin-email">البريد الإلكتروني</label>
              <div class="relative flex items-center bg-surface-alt rounded-xl border border-border-subtle focus-within:border-brand-500 focus-within:bg-surface focus-within:ring-4 focus-within:ring-brand-500/10 transition-all">
                <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-on-surface-variant">
                  <span class="material-symbols-outlined text-headline-sm">alternate_email</span>
                </div>
                <input formControlName="email" autocomplete="email" class="w-full h-12 ps-12 pe-4 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline border-none focus:outline-none focus:ring-0" id="admin-email" placeholder="admin@orcacrm.com" type="email">
              </div>
            </div>

            <!-- Field 2: Password -->
            <div class="flex flex-col gap-2">
              <label class="font-label-md text-label-md text-on-surface font-semibold" for="admin-password">كلمة المرور</label>
              <div class="relative flex items-center bg-surface-alt rounded-xl border border-border-subtle focus-within:border-brand-500 focus-within:bg-surface focus-within:ring-4 focus-within:ring-brand-500/10 transition-all">
                <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-on-surface-variant">
                  <span class="material-symbols-outlined text-headline-sm">lock</span>
                </div>
                <input formControlName="password" autocomplete="current-password" class="w-full h-12 ps-12 pe-12 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline border-none focus:outline-none focus:ring-0" id="admin-password" placeholder="••••••••••••" [type]="showPassword() ? 'text' : 'password'">
                <button (click)="togglePassword()" aria-label="إظهار أو إخفاء كلمة المرور" class="absolute inset-y-0 end-0 flex items-center pe-3.5 text-outline hover:text-brand-600 transition-colors cursor-pointer" type="button">
                  <span class="material-symbols-outlined text-headline-sm">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="flex items-center justify-between pt-1">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input formControlName="rememberMe" class="w-4 h-4 rounded text-brand-600 focus:ring-0 cursor-pointer accent-brand-600 border-border-subtle" type="checkbox">
                <span class="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors">تذكرني</span>
              </label>
              <a class="font-label-sm text-label-sm text-brand-600 font-semibold hover:underline" href="javascript:void(0)">نسيت كلمة المرور؟</a>
            </div>

            <!-- Primary Submit Button -->
            <button [disabled]="loginForm.invalid || isLoading()" class="w-full h-12 mt-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" type="submit">
              @if (!isLoading()) {
                <span>تسجيل الدخول</span>
                <span class="material-symbols-outlined text-headline-sm transform scale-x-[-1]">arrow_forward</span>
              } @else {
                <span class="material-symbols-outlined text-headline-sm animate-spin">progress_activity</span>
                <span>جاري التحقق...</span>
              }
            </button>
          </form>
        </div>
      </div>

      <!-- Left Side: Clean Deep Indigo Brand Area -->
      <div class="w-full lg:w-5/12 xl:w-1/2 relative bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 overflow-hidden flex items-center justify-center p-8 sm:p-12 lg:p-16 min-h-[400px] lg:min-h-screen">
        <div class="absolute inset-0 pointer-events-none opacity-15" style="background-image: radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px); background-size: 28px 28px;"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500 rounded-full blur-[100px] opacity-25 pointer-events-none"></div>
        
        <div class="relative z-10 max-w-lg text-center">
          <h2 class="text-3xl xl:text-4xl font-bold tracking-tight text-white leading-snug mb-6">منظومة orca CRM لإدارة العمليات الرقمية</h2>
          <p class="text-white/80 font-body-lg text-body-lg leading-relaxed">بيئة مركزية متكاملة وسلسة مصممة لإدارة وتنسيق كافة العمليات والبيانات بكفاءة واعتمادية غير مسبوقة تحت مظلة orcaXTECH.</p>
        </div>
      </div>
    </div>
  `
})
export class Login {
  private fb = inject(FormBuilder);
  private authStore = inject(AuthStore);
  private authService = inject(AuthService);
  private router = inject(Router);

  showPassword = signal(false);
  loginError = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['admin@orcacrm.com', [Validators.required, Validators.email]],
    password: ['password123', [Validators.required, Validators.minLength(6)]],
    rememberMe: [true]
  });

  isLoading = signal(false);

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.loginError.set(null);

      const { email, password } = this.loginForm.value;

      this.authService.login({ email: email!, password: password! }).subscribe({
        next: (response) => {
          this.authStore.loginSuccess(response.access_token, response.user);
          this.isLoading.set(false);
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.loginError.set(
            err.status === 401
              ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
              : 'حدث خطأ في الاتصال بالخادم. حاول مرة أخرى.'
          );
        },
      });
    }
  }
}

