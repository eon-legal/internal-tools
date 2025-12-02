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
    url: 'https://wzmppksgwtdffnxhkljh.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6bXBwa3Nnd3RkZmZueGhrbGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDYzMzAsImV4cCI6MjA3NjAyMjMzMH0.1Kl_fh6AlNo0vKc_-a2Vxh07WYQs3EDJVthuLhwjZ8A',
  },
};

