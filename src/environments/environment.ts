/**
 * Development environment configuration
 *
 * This file contains configuration values for local development.
 * The Supabase credentials point to the DEVELOPMENT database instance.
 *
 * IMPORTANT:
 * - Use `ng serve` or `npm start` to run with this configuration
 * - Replace the placeholder Supabase values with your development database credentials
 * - DO NOT use production credentials in this file
 *
 * @see environment.prod.ts for production configuration
 */
export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyACfLV8asrf62FJcpiPSVbN7jMZT42IusM',
    authDomain: 'eontech-solutions-web.firebaseapp.com',
    projectId: 'eontech-solutions-web',
    storageBucket: 'eontech-solutions-web.firebasestorage.app',
    messagingSenderId: '790481331254',
    appId: '1:790481331254:web:9c9d41b78ba00ef09ba497',
    measurementId: 'G-2RRB8ZYXJ5',
  },
  remoteConfig: {
    minimumFetchIntervalMillis: 1000,
  },
  supabase: {
    /**
     * Development Supabase Configuration (eon-invoice-backend-wip)
     * Project ID: rrmjetsmwookypdtpvna
     * Region: eu-central-1
     */
    url: 'https://rrmjetsmwookypdtpvna.supabase.co',
    anonKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybWpldHNtd29va3lwZHRwdm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NzI2MTEsImV4cCI6MjA4MDQ0ODYxMX0.DyWt56SoBQ1lDb6OvAr69JWTgzXxVPdYI7CexcI509M',
  },
  auth: {
    /** Enable user registration in development */
    registrationEnabled: true,
  },
  captcha: {
    /** CAPTCHA disabled in development */
    enabled: false,
    turnstileSiteKey: '',
  },
  rocketchat: {
    /** Supabase Edge Function proxy to avoid CORS when calling Rocket.Chat webhook */
    webhookUrl: 'https://wzmppksgwtdffnxhkljh.supabase.co/functions/v1/rocketchat-webhook-proxy',
  },
  tpv: {
    /**
     * Points at the development Supabase project's send-payment-link function.
     * For purely local edge-function development, replace with
     * http://localhost:54321/functions/v1/send-payment-link.
     */
    sendPaymentLinkFnUrl:
      'https://rrmjetsmwookypdtpvna.supabase.co/functions/v1/send-payment-link',
  },
};

