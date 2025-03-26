import { Component, EventEmitter, Output } from '@angular/core';
import { DragDropModule } from 'primeng/dragdrop';

/**
 * DragDropAreaComponent is a reusable component that provides a drag-and-drop area for files.
 * It allows users to drag and drop files (e.g., images) into the designated area and emits the dropped files to the parent component.
 */
@Component({
  selector: 'app-drag-drop-area', // Selector for the component
  standalone: true, // Indicates that this is a standalone component
  imports: [DragDropModule], // Imports PrimeNG's DragDropModule for drag-and-drop functionality
  templateUrl: './drag-drop-area.component.html', // Template for the component
  styleUrl: './drag-drop-area.component.scss', // Styles for the component
})
export class DragDropAreaComponent {
  /**
   * A note or instruction displayed in the drag-and-drop area.
   * @type {string}
   * @default 'Arrastre y suelte imágenes aquí.' (Drag and drop images here.)
   */
  note = 'Arrastre y suelte imágenes aquí.';

  /**
   * Output event that emits the list of files dropped into the area.
   * @type {EventEmitter<FileList>}
   */
  @Output() fileDrop = new EventEmitter<FileList>();

  /**
   * Handles the drag-over event to allow dropping files.
   * Prevents the default browser behavior to enable the drop event.
   * @param event - The drag-over event.
   */
  onDragOver(event: DragEvent) {
    event.preventDefault(); // Prevents the default behavior to allow dropping
  }

  /**
   * Handles the drop event when files are dropped into the area.
   * Emits the dropped files to the parent component.
   * @param event - The drop event.
   */
  onDrop(event: DragEvent) {
    event.preventDefault(); // Prevents the default behavior
    if (event.dataTransfer?.files) {
      // Emits the dropped files to the parent component
      this.fileDrop.emit(event.dataTransfer.files);
    }
  }
}
