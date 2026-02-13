/**
 * Dashboard Component
 *
 * Responsibilities:
 * - Display invoice statistics using charts and metrics
 * - Provide date range filtering for dashboard data
 * - Navigate to detailed invoice list view
 *
 * Dependencies:
 * - InvoicesListStore for invoice data
 * - LanguageService for i18n
 * - PrimeNG Chart components for visualizations
 *
 * Business Rules:
 * - Shows totals for invoiced, paid, and pending amounts
 * - Shows counts for total, paid, and pending invoices
 * - Monthly invoice count bar chart shows activity volume over time
 * - Collection rate line chart shows payment health over time
 * - Average invoice value line chart shows deal size trends
 * - Monthly revenue breakdown line chart shows amount trends over time
 */

import { Component, OnInit, OnDestroy, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// PrimeNG imports
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Services and Store
import { InvoicesListStore } from '../../../invoices/state/invoices-list.store';
import { LanguageService } from '../../../../shared/services/language/language.service';

// Domain logic
import {
  InvoiceData,
  InvoiceSummary,
  MonthlyData,
  MonthlyAverageValue,
  DateRange,
  filterInvoicesByDateRange,
  calculateInvoiceSummary,
  calculateMonthlyData,
  calculateMonthlyAverageValue,
  getDefaultDateRange,
  formatCurrency,
} from '../../../../domain/dashboard/dashboard-calculations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ChartModule,
    CardModule,
    ButtonModule,
    DatePickerModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Inject dependencies
  private readonly router = inject(Router);
  readonly store = inject(InvoicesListStore);
  readonly languageService = inject(LanguageService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  // Date range filter (using regular properties for ngModel compatibility)
  filterStartDate: Date | null = null;
  filterEndDate: Date | null = null;

  // Internal signals for reactivity
  private startDateSignal = signal<Date | null>(null);
  private endDateSignal = signal<Date | null>(null);

  // Chart data
  monthlyCountChartData: any = null;
  collectionRateChartData: any = null;
  avgInvoiceValueChartData: any = null;
  monthlyChartData: any = null;
  barChartOptions: any = null;
  lineChartOptions: any = null;
  invoicedVsCollectedChartOptions: any = null;
  currencyChartOptions: any = null;

  // Computed summary from filtered invoices
  summary = computed<InvoiceSummary>(() => {
    // Access signals directly to trigger reactivity
    const allInvoices = this.store.allInvoices();
    const startDate = this.startDateSignal();
    const endDate = this.endDateSignal();

    // Map Invoice to InvoiceData
    const invoiceData: InvoiceData[] = allInvoices.map(inv => ({
      id: inv.id,
      invoice_date: inv.invoice_date,
      total_amount: inv.total_amount,
      iva_amount: inv.iva_amount,
      paid: inv.paid,
    }));

    // Filter by date range
    const dateRange: DateRange = { startDate, endDate };
    const filtered = filterInvoicesByDateRange(invoiceData, dateRange);

    return calculateInvoiceSummary(filtered);
  });

  // Computed monthly data
  monthlyData = computed<MonthlyData[]>(() => {
    // Access signals directly to trigger reactivity
    const allInvoices = this.store.allInvoices();
    const startDate = this.startDateSignal();
    const endDate = this.endDateSignal();

    // Map Invoice to InvoiceData
    const invoiceData: InvoiceData[] = allInvoices.map(inv => ({
      id: inv.id,
      invoice_date: inv.invoice_date,
      total_amount: inv.total_amount,
      iva_amount: inv.iva_amount,
      paid: inv.paid,
      paid_at: inv.paid_at,
    }));

    // Filter by date range
    const dateRange: DateRange = { startDate, endDate };
    const filtered = filterInvoicesByDateRange(invoiceData, dateRange);

    const locale = this.languageService.getCurrentLanguage() === 'es' ? 'es-ES' : 'en-US';
    return calculateMonthlyData(filtered, locale);
  });

  constructor() {
    // Effect to update charts when data changes
    effect(() => {
      const summary = this.summary();
      const monthly = this.monthlyData();
      this.updateCharts(summary, monthly);
    });
  }

  ngOnInit(): void {
    // Set default date range (last 12 months)
    const defaultRange = getDefaultDateRange();
    this.filterStartDate = defaultRange.startDate;
    this.filterEndDate = defaultRange.endDate;
    this.startDateSignal.set(defaultRange.startDate);
    this.endDateSignal.set(defaultRange.endDate);

    // Initialize chart options
    this.initChartOptions();

    // Subscribe to language changes
    this.subscriptions.push(
      this.languageService.onLanguageChange().subscribe(() => {
        this.initChartOptions();
        this.refreshCharts();
      })
    );

    // Load invoices
    this.store.loadInvoices();
  }

  /**
   * Refresh charts with current data
   */
  private refreshCharts(): void {
    const summary = this.summary();
    const monthly = this.monthlyData();
    this.updateCharts(summary, monthly);
  }

  /**
   * Initialize chart options
   */
  private initChartOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color') || '#495057';
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dfe7ef';

    // Bar chart options (monthly invoice count)
    this.barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor },
        },
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary,
            stepSize: 1,
            precision: 0,
          },
          grid: { color: surfaceBorder },
        },
      },
    };

    // Line chart options (monthly revenue breakdown)
    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor },
        },
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder },
        },
        y: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder },
        },
      },
    };

    // Invoiced vs Collected bar chart options
    this.invoicedVsCollectedChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor },
        },
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary,
            callback: (value: number) => formatCurrency(value),
          },
          grid: { color: surfaceBorder },
        },
      },
    };

    // Currency chart options (average invoice value)
    this.currencyChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor },
        },
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary,
            callback: (value: number) => formatCurrency(value),
          },
          grid: { color: surfaceBorder },
        },
      },
    };
  }

  /**
   * Update charts with new data
   */
  private updateCharts(summary: InvoiceSummary, monthly: MonthlyData[]): void {
    // Pastel color palette
    const pastelGreen = '#A8E6CF';      // Pastel green (paid)
    const pastelOrange = '#FFD3B6';     // Pastel orange (pending)
    const pastelBlue = '#A8D8EA';       // Pastel blue (invoice count)
    const pastelPink = '#FFB6C1';       // Pastel pink (collection rate)
    const pastelPurple = '#D4A5FF';     // Pastel purple (invoiced)
    const pastelTeal = '#B2DFDB';       // Pastel teal (avg value)

    // Derived data
    const averageValues = calculateMonthlyAverageValue(monthly);

    // Monthly invoice count (bar chart)
    this.monthlyCountChartData = {
      labels: monthly.map((m) => m.monthLabel),
      datasets: [
        {
          label: this.getText('dashboard.charts.invoice_count'),
          data: monthly.map((m) => m.countTotal),
          backgroundColor: pastelBlue,
          borderColor: pastelBlue,
          borderWidth: 1,
        },
      ],
    };

    // Invoiced vs Collected per month (grouped bar chart)
    this.collectionRateChartData = {
      labels: monthly.map((m) => m.monthLabel),
      datasets: [
        {
          label: this.getText('dashboard.charts.invoiced'),
          data: monthly.map((m) => m.totalInvoiced),
          backgroundColor: pastelPurple,
          borderColor: pastelPurple,
          borderWidth: 1,
        },
        {
          label: this.getText('dashboard.charts.collected'),
          data: monthly.map((m) => m.totalPaid),
          backgroundColor: pastelGreen,
          borderColor: pastelGreen,
          borderWidth: 1,
        },
      ],
    };

    // Average invoice value over time (line chart)
    this.avgInvoiceValueChartData = {
      labels: averageValues.map((m) => m.monthLabel),
      datasets: [
        {
          label: this.getText('dashboard.charts.avg_value'),
          data: averageValues.map((m) => m.averageValue),
          fill: false,
          borderColor: pastelTeal,
          backgroundColor: pastelTeal,
          tension: 0.4,
        },
      ],
    };

    // Monthly revenue breakdown (line chart - kept unchanged)
    this.monthlyChartData = {
      labels: monthly.map((m) => m.monthLabel),
      datasets: [
        {
          label: this.getText('dashboard.charts.invoiced'),
          data: monthly.map((m) => m.totalInvoiced),
          fill: false,
          borderColor: pastelPurple,
          backgroundColor: pastelPurple,
          tension: 0.4,
        },
        {
          label: this.getText('dashboard.charts.paid'),
          data: monthly.map((m) => m.totalPaid),
          fill: false,
          borderColor: pastelGreen,
          backgroundColor: pastelGreen,
          tension: 0.4,
        },
      ],
    };
  }

  /**
   * Get translated text
   */
  getText(key: string): string {
    return this.languageService.getText(key);
  }

  /**
   * Format currency for display
   */
  formatAmount(amount: number): string {
    return formatCurrency(amount);
  }

  /**
   * Handle date filter change
   */
  onDateFilterChange(): void {
    // Update signals to trigger reactivity
    this.startDateSignal.set(this.filterStartDate);
    this.endDateSignal.set(this.filterEndDate);
    this.refreshCharts();
  }

  /**
   * Clear date filters
   */
  clearDateFilters(): void {
    const defaultRange = getDefaultDateRange();
    this.filterStartDate = defaultRange.startDate;
    this.filterEndDate = defaultRange.endDate;
    this.startDateSignal.set(defaultRange.startDate);
    this.endDateSignal.set(defaultRange.endDate);
    this.refreshCharts();
  }

  /**
   * Navigate to invoice list
   */
  goToInvoices(): void {
    this.router.navigate(['/invoices']);
  }

  /**
   * Navigate to create invoice
   */
  createInvoice(): void {
    this.router.navigate(['/invoices/create']);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}

