import { Component, EventEmitter, Output } from '@angular/core';
import { DragDropModule } from 'primeng/dragdrop';

@Component({
  selector: 'app-drag-drop-area',
  standalone: true,
  imports: [DragDropModule],
  templateUrl: './drag-drop-area.component.html',
  styleUrl: './drag-drop-area.component.scss',
})
export class DragDropAreaComponent {
  note = 'Arrastre y suelte imágenes aquí.';
  @Output() fileDrop = new EventEmitter<FileList>();
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }
  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      //const files = event.dataTransfer.files;
      this.fileDrop.emit(event.dataTransfer?.files);
      //this.validateAndAssignFiles(files, false);
    }
  }
}
