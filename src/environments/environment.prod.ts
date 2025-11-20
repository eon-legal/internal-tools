/**
 * Production environment configuration
 * This file contains configuration values for the production environment.
 *
 * IMPORTANT: Replace these values with production Firebase and Supabase credentials.
 * Consider using environment variables or secret management for production.
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
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
  },
};

