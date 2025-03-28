import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FileSelectEvent,
  FileUpload,
  FileUploadModule,
} from 'primeng/fileupload';

/**
 * FileUploadComponent is a reusable component for handling file uploads.
 * It integrates with PrimeNG's FileUploadModule to provide a user-friendly file upload interface.
 */
@Component({
  selector: 'app-file-upload', // Selector for the component
  standalone: true, // Indicates that this is a standalone component
  imports: [FileUploadModule], // Imports PrimeNG's FileUploadModule for file upload functionality
  templateUrl: './file-upload.component.html', // Template for the component
  styleUrl: './file-upload.component.scss', // Styles for the component
})
export class FileUploadComponent {
  // Input properties
  @Input() accept: string[] = []; // Allowed file types (e.g., ['.pdf', '.jpg'])
  @Input() uploadIcon!: string; // Icon for the upload button
  @Input() styleClass!: string; // Custom CSS class for styling
  @Input() name!: string; // Name attribute for the file input
  @Input() auto: boolean = false; // Whether to upload files automatically
  @Input() noFooter: boolean = false; // Whether to hide the footer section
  @Input() multiple: boolean = false; // Whether to allow multiple file selection
  @Input() chooseLabel = 'Seleccionar'; // Label for the choose button
  @Input() uploadLabel = 'Descargar'; // Label for the upload button
  @Input() cancelLabel = 'Limpiar'; // Label for the cancel button
  @Input() files: File[] = []; // Initial files to be displayed

  // Output events
  @Output() clean = new EventEmitter<void>(); // Emits when the file list is cleared
  @Output() upload = new EventEmitter<void>(); // Emits when files are uploaded
  @Output() select = new EventEmitter<File[]>(); // Emits when files are selected

  // Reference to the PrimeNG FileUpload component
  @ViewChild(FileUpload) fileUpload!: FileUpload;

  // Signal to manage the selected files
  selectedFiles = signal<File[]>([]);

  /**
   * Handles the file upload event.
   * Emits the `upload` event to notify the parent component.
   */
  onUpload() {
    this.upload.emit();
  }

  /**
   * Handles the file selection event.
   * Filters out duplicate files and updates the selected files list.
   * @param event - The file selection event containing the selected files.
   */
  onFileSelect(event: FileSelectEvent) {
    const newFiles = Array.from(event.files); // Convert FileList to an array of Files

    // Filter out duplicate files
    const uniqueFiles = newFiles.filter((file) => {
      return !this.selectedFiles().some(
        (selectedFile) =>
          selectedFile.name === file.name &&
          selectedFile.size === file.size &&
          selectedFile.lastModified === file.lastModified
      );
    });

    if (uniqueFiles.length > 0) {
      // Update the signal with the new files
      this.selectedFiles.set([...this.selectedFiles(), ...uniqueFiles]);

      // Emit the new files to the parent component
      this.select.emit(uniqueFiles);
    }
  }

  /**
   * Sets the selected files programmatically.
   * @param files - The files to set.
   */
  setFiles(files: File[]) {
    this.selectedFiles.set(files); // Update the signal
  }

  /**
   * Handles the clear event.
   * Emits the `clean` event and clears the file list if there are any files.
   */
  onClear() {
    this.clean.emit();
    if (this.getFiles().length) this.clearFiles();
  }

  /**
   * Returns the currently selected files.
   * @returns {File[]} - The list of selected files.
   */
  getFiles(): File[] {
    return this.selectedFiles(); // Get the current value of the signal
  }

  /**
   * Clears the selected files and resets the file upload component.
   */
  clearFiles() {
    this.selectedFiles.set([]); // Clear the signal
    this.fileUpload.clear(); // Reset the PrimeNG FileUpload component
  }

  /**
   * Generates the `accept` attribute value for the file input.
   * @returns {string} - The formatted `accept` attribute value.
   */
  getAccept(): string {
    let modifiedString = '';
    for (let i = 0; i < this.accept.length; i++) {
      let separtePoint = i === 0 || i - 1 === this.accept.length ? '.' : ',.';
      modifiedString = modifiedString + separtePoint + this.accept[i];
    }
    return this.accept.length ? modifiedString : '*'; // Return '*' if no specific types are provided
  }
}
