import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FileSelectEvent,
  FileUpload,
  FileUploadModule,
} from 'primeng/fileupload';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [FileUploadModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
})
export class FileUploadComponent {
  @Input() accept: string[];
  @Input() uploadIcon: string;
  @Input() customUpload: boolean = false;
  @Input() styleClass: string;
  @Input() name: string;
  @Input() auto: boolean = false;
  @Input() multiple: boolean = false;
  @Input() chooseLabel = 'Seleccionar';
  @Input() uploadLabel = 'Descargar';
  @Input() cancelLabel = 'Limpiar';
  @Input() files: File[] = [];
  @Output() clean = new EventEmitter<void>();
  @Output() upload = new EventEmitter<void>();
  @Output() select = new EventEmitter<File[]>();
  @ViewChild(FileUpload) fileUpload!: FileUpload;
  private selectedFiles: File[] = [];
  onUpload() {
    this.upload.emit();
  }
  onFileSelect(event: FileSelectEvent) {
    if (this.accept.length === 0) {
      const newFiles = Array.from(event.files); //convertir FileList a un array File
      this.selectedFiles = [...this.selectedFiles, ...newFiles]; //acumular archivos
      this.select.emit(this.selectedFiles);
    } else {
      //const allowedExtensions = this.accept.split('.');
      const newFiles = Array.from(event.files).filter((file) => {
        const extension = file.type.split('/')[1];
        return this.accept.includes(extension);
      });
      this.selectedFiles = [...this.selectedFiles, ...newFiles]; // acumular archivos
      this.select.emit(this.selectedFiles);
    }
  }
  setFiles(file: File[]) {
    this.selectedFiles = file;
  }
  onClear() {
    this.clean.emit();
    if (this.getFiles().length) this.clearFiles();
  }
  getFiles(): File[] {
    return this.selectedFiles || [];
  }
  clearFiles() {
    this.selectedFiles = [];
    this.fileUpload.clear();
  }
  getAccept(): string {
    let modifiedString = '';
    for (let i = 0; i < this.accept.length; i++) {
      let separtePoint = i === 0 || i - 1 === this.accept.length ? '.' : ',.';
      modifiedString = modifiedString + separtePoint + this.accept[i];
    }
    return this.accept.length ? modifiedString : '*';
  }
}
