/**
 * Development environment configuration
 * This file contains configuration values for the development environment.
 * DO NOT commit sensitive credentials to version control.
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
};

