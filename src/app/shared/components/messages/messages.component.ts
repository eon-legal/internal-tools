import { Component, Input } from '@angular/core';
import { MessageModule } from 'primeng/message';
@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [MessageModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent {
  @Input() errorMessage: string = '';
}
