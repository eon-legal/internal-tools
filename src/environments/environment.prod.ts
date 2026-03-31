/**
 * Production environment configuration
 *
 * This file contains configuration values for the production environment.
 * The Supabase credentials point to the PRODUCTION database instance.
 *
 * IMPORTANT:
 * - This file is used when running `ng build --configuration production`
 * - These credentials connect to the live production database
 * - Changes to this file affect the deployed application
 *
 * @see environment.ts for development configuration
 */
export const environment = {
  production: true,
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
    minimumFetchIntervalMillis: 3600000, // 1 hour for production
  },
  supabase: {
    /**
     * Production Supabase Configuration (eon-invoice-backend)
     * Project ID: wzmppksgwtdffnxhkljh
     * Region: eu-west-1
     */
    url: 'https://wzmppksgwtdffnxhkljh.supabase.co',
    anonKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6bXBwa3Nnd3RkZmZueGhrbGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDYzMzAsImV4cCI6MjA3NjAyMjMzMH0.1Kl_fh6AlNo0vKc_-a2Vxh07WYQs3EDJVthuLhwjZ8A',
  },
  auth: {
    /** Disable user registration in production by default */
    registrationEnabled: true,
  },
  captcha: {
    /** Cloudflare Turnstile CAPTCHA enabled in production */
    enabled: true,
    turnstileSiteKey: '0x4AAAAAACaxcvxoaGWwDNK-',
  },
  rocketchat: {
    /** Supabase Edge Function proxy to avoid CORS when calling Rocket.Chat webhook */
    webhookUrl: 'https://wzmppksgwtdffnxhkljh.supabase.co/functions/v1/rocketchat-webhook-proxy',
  },
};

