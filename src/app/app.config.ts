import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideToastr } from 'ngx-toastr';
import { DialogService } from 'primeng/dynamicdialog';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import {
  provideRemoteConfig,
  getRemoteConfig,
} from '@angular/fire/remote-config';

import { getStorage, provideStorage } from '@angular/fire/storage';

export const provideTranslation = () => ({
  //defaultLanguage: "en",
  loader: {
    provide: TranslateLoader,
    useFactory: HttpLoaderFactory,
    deps: [HttpClient],
  },
});

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const firebaseConfig = {
  apiKey: 'AIzaSyACfLV8asrf62FJcpiPSVbN7jMZT42IusM',
  authDomain: 'eontech-solutions-web.firebaseapp.com',
  projectId: 'eontech-solutions-web',
  storageBucket: 'eontech-solutions-web.firebasestorage.app',
  messagingSenderId: '790481331254',
  appId: '1:790481331254:web:9c9d41b78ba00ef09ba497',
  measurementId: 'G-2RRB8ZYXJ5',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideToastr({ timeOut: 2000, preventDuplicates: true }),
    provideHttpClient(),
    DialogService,
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
    importProvidersFrom([TranslateModule.forRoot(provideTranslation())]),
    // aqui viene firebase
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()), // Provides Firebase Authentication service
    // Provide Firebase Authentication service
    provideFirestore(() => getFirestore()), // Provides Firebase Firestore service
    provideStorage(() => getStorage()), // Fournit le service Firebase Storage
    provideRemoteConfig(() => getRemoteConfig()),
    //provideHttpClient(withInterceptors([loggingInterceptor])),
    provideRemoteConfig(() => {
      const remoteConfig = getRemoteConfig();
      remoteConfig.settings.minimumFetchIntervalMillis = 1000;
      return remoteConfig;
    }),
  ],
};
