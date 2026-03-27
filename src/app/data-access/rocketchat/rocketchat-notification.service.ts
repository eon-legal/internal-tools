/**
 * Rocket.Chat Notification Service
 *
 * Responsibilities:
 * - Send invoice payment notifications to a Rocket.Chat channel via incoming webhook.
 * - Format a Markdown message summarising one or more paid invoices.
 *
 * Dependencies:
 * - Angular HttpClient for the outgoing POST request.
 * - Environment configuration (rocketchat.webhookUrl) for the endpoint.
 *
 * Business Rules:
 * - If webhookUrl is empty the service skips the request and returns success.
 * - Multiple invoices are batched into a single message.
 * - The HTTP call must NOT carry the Supabase Bearer token (excluded in authInterceptor).
 *
 * Side Effects:
 * - Sends an HTTP POST to the configured Rocket.Chat webhook URL.
 *
 * Invariants:
 * - Service is tree-shakeable (providedIn: 'root').
 * - No credentials are ever forwarded to the external webhook.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Invoice } from '../../features/invoices/interfaces/database-models';

interface RocketChatAttachment {
  title: string;
  text: string;
  color: string;
}

interface RocketChatPayload {
  alias: string;
  text: string;
  attachments: RocketChatAttachment[];
}

@Injectable({ providedIn: 'root' })
export class RocketChatNotificationService {
  private readonly http = inject(HttpClient);
  private readonly webhookUrl = environment.rocketchat.webhookUrl;

  /**
   * Send a notification for one or more invoices that have just been marked as paid.
   * Returns an observable that completes when the request is done.
   * If no webhook URL is configured, returns an observable that completes immediately.
   */
  notifyInvoicesPaid(invoices: Invoice[]): Observable<unknown> {
    if (!this.webhookUrl || invoices.length === 0) {
      return of(null);
    }

    const payload = this.buildPayload(invoices);
    return this.http.post(this.webhookUrl, payload);
  }

  /**
   * Build the Rocket.Chat webhook payload with alias and attachments.
   */
  private buildPayload(invoices: Invoice[]): RocketChatPayload {
    const isSingle = invoices.length === 1;
    const headerText = isSingle
      ? ':white_check_mark: Invoice marked as paid'
      : `:white_check_mark: ${invoices.length} invoices marked as paid`;

    const attachmentLines: string[] = [];

    if (isSingle) {
      const inv = invoices[0]!;
      attachmentLines.push(`*Number:* ${inv.invoice_number}`);
      if (inv.sender_name) attachmentLines.push(`*Recipient:* ${inv.sender_name}`);
      if (inv.destination_name) attachmentLines.push(`*Sender:* ${inv.destination_name}`);
      attachmentLines.push(`*Total:* ${this.formatCurrency(inv.total_amount)}`);
    } else {
      for (const inv of invoices) {
        const parts = [`*${inv.invoice_number}*`];
        if (inv.sender_name) parts.push(inv.sender_name);
        parts.push(this.formatCurrency(inv.total_amount));
        attachmentLines.push(`• ${parts.join(' — ')}`);
      }
      const total = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
      attachmentLines.push('');
      attachmentLines.push(`*Total collected:* ${this.formatCurrency(total)}`);
    }

    return {
      alias: '[EON Invoices]',
      text: headerText,
      attachments: [
        {
          title: isSingle ? `Invoice ${invoices[0]!.invoice_number}` : `${invoices.length} Invoices`,
          text: attachmentLines.join('\n'),
          color: '#2ECC71',
        },
      ],
    };
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }
}

