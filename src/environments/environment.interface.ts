/**
 * Environment Configuration Interface
 *
 * Defines the structure of environment configuration files.
 * All environment files (environment.ts, environment.prod.ts) must conform to this interface.
 */
export interface Environment {
  /** Flag indicating if this is a production build */
  production: boolean;

  /** Firebase configuration */
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };

  /** Firebase Remote Config settings */
  remoteConfig: {
    /** Minimum interval between config fetches in milliseconds */
    minimumFetchIntervalMillis: number;
  };

  /** Supabase database configuration */
  supabase: {
    /** Supabase project URL (e.g., https://your-project.supabase.co) */
    url: string;
    /** Supabase anonymous/public API key */
    anonKey: string;
  };

  /** Authentication configuration */
  auth: {
    /** Whether user registration is enabled. When false, only login is available. */
    registrationEnabled: boolean;
  };

  /** CAPTCHA configuration (Cloudflare Turnstile) */
  captcha: {
    /** Whether CAPTCHA verification is enabled on auth forms */
    enabled: boolean;
    /** Cloudflare Turnstile site key (public, used client-side) */
    turnstileSiteKey: string;
  };

  /** Rocket.Chat integration configuration */
  rocketchat: {
    /** Incoming webhook URL for sending notifications. Leave empty to disable. */
    webhookUrl: string;
  };

  /** Cecabank TPV Virtual integration */
  tpv: {
    /**
     * URL of the send-payment-link Supabase Edge Function. The frontend only
     * needs to call this; merchant credentials and clave_encriptacion live
     * server-side as Supabase secrets and never reach the browser bundle.
     */
    sendPaymentLinkFnUrl: string;
  };
}

