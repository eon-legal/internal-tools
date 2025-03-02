import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { CalendarModule } from 'primeng/calendar';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CalendarModule, FormsModule,ReactiveFormsModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit{
  date1: Date | undefined;
  date2: Date | undefined;
  date3: Date | undefined;
  title = 'internal-tools';
  data = [
    {
      input: 'src/themes-fluent-light.scss',
      bundleName: 'fluent-light',
      inject: false,
    },
    {
      input: 'src/themes-lara-light-blue.scss',
      bundleName: 'lara-light-blue',
      inject: false,
    },
    {
      input: 'src/themes-lara-light-indigo.scss',
      bundleName: 'lara-light-indigo',
      inject: false,
    },
    {
      input: 'src/themes-lara-light-purple.scss',
      bundleName: 'lara-light-purple',
      inject: false,
    },
    {
      input: 'src/themes-lara-light-teal.scss',
      bundleName: 'lara-light-teal',
      inject: false,
    },
    {
      input: 'src/themes-lara-dark-blue.scss',
      bundleName: 'lara-dark-blue',
      inject: false,
    },
    {
      input: 'src/themes-lara-dark-indigo.scss',
      bundleName: 'lara-dark-indigo',
      inject: false,
    },
    {
      input: 'src/themes-lara-dark-purple.scss',
      bundleName: 'lara-dark-purple',
      inject: false,
    },
    {
      input: 'src/themes-lara-dark-teal.scss',
      bundleName: 'lara-dark-teal',
      inject: false,
    },
    {
      input: 'src/themes-saga-blue.scss',
      bundleName: 'saga-blue',
      inject: false,
    },
  ];
  nameTheme = this.data[0].bundleName;
  count = 0;
  themeService: ThemeService = inject(ThemeService);
  formGroup!: FormGroup;
  constructor(public fb: FormBuilder){

  }
  ngOnInit(): void {
    this.formGroup = this.fb.group({
       dateOne: new FormControl(),
       dateTwo: new FormControl(),
       dateThree: new FormControl()
    })
  }
  changeTheme() {
    if (this.count === this.data.length) this.count = 0;
    this.themeService.switchTheme(this.data[this.count].bundleName);
    this.nameTheme = this.data[this.count].bundleName;
    this.count++;
  }
}
