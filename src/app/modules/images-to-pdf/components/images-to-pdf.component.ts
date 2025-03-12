import {
  AfterViewInit,
  Component,
  inject,
  TemplateRef,
  ViewChild,
} from '@angular/core';

import {
  FileSelectEvent,
  FileUpload,
  FileUploadModule,
} from 'primeng/fileupload';
import { TableGenericComponent } from '../../../shared/components/table-generic/table-generic.component';
import { HeaderTable } from '../../../shared/interfaces/header-table';
import {
  ButtonGenericInterface,
  FormatOptions,
} from '../../../shared/interfaces/buttons';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DownloadImagePdfService } from '../services/download-image-pdf.service';
import { DragDropModule } from 'primeng/dragdrop';
import { MessageModule } from 'primeng/message';
import { ConfirmationService } from '../../../shared/services/confirmation/confirmation.service';
import { ButtonGenericComponent } from '../../../shared/components/button-generic/button-generic.component';
import { filterFiles } from '../utils/filter-file';

@Component({
  selector: 'app-images-to-pdf',
  standalone: true,
  imports: [
    FileUploadModule,
    DragDropModule,
    MessageModule,
    TableGenericComponent,
    ButtonGenericComponent,
  ],
  templateUrl: './images-to-pdf.component.html',
  styleUrl: './images-to-pdf.component.scss',
})
export class ImagesToPdfComponent implements AfterViewInit {
  orderTable: boolean = false;
  arrayFileWhitOutChange: File[] = [];
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  buttons: ButtonGenericInterface = {
    css: 'flex flex-column md:flex-row md:justify-content-end gap-2',
    buttons: [
      {
        id: 1,
        icon: 'pi pi-check',
        label: 'Restablecer Orden Inicial Archivos',
        severity: 'primary',
        disabled: !this.fileUpload?.files?.length,
        action: () => this.restartTable(),
      },
    ],
  };
  myfile: File[] = [];
  @ViewChild('imageTemplate') imageTemplate!: TemplateRef<any>;

  @ViewChild(TableGenericComponent)
  tableGenericComponent!: TableGenericComponent<File>;
  confirmationService: ConfirmationService = inject(ConfirmationService);
  listPagination = [5, 10, 20, 50, 100];
  acceptedFiles: string = '.jpg,.jpeg,.png,.gif';
  messagesFiles: string = 'Solo se aceptan imágenes.';
  chooseLabel = 'Seleccionar';
  uploadLabel = 'Descargar';
  cancelLabel = 'Limpiar';
  headerData: HeaderTable<File>[] = [];
  operation: ButtonGenericInterface = {
    buttons: [
      {
        id: 1,
        icon: 'pi pi-trash',
        severity: 'danger',
        action: (row: File) => this.deleteTest(row),
      },
    ],
  };
  formatOptions: FormatOptions<File> = {
    size: {
      formatFunction: (v) => {
        if (v.size === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(v.size) / Math.log(k));
        return (
          parseFloat((v.size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
        );
      },
    },
    type: {
      formatFunction: (v) => {
        const [image, format] = v.type.split('/');
        return format.toUpperCase();
      },
    },
  };
  enableDragDrop = true;
  note = 'Arrastre y suelte imágenes aquí.';
  errorMessage: string = '';

  sanitizer: DomSanitizer = inject(DomSanitizer);
  downloadImagePdfService: DownloadImagePdfService = inject(
    DownloadImagePdfService
  );

  ngAfterViewInit() {
    setTimeout(() => {
      this.headerData = [
        {
          field: 'text',
          header: 'Imagen',
          customContent: this.customContentTemplate1,
        },
        {
          field: 'name',
          header: 'Nombre',
        },
        {
          field: 'size',
          header: 'Tamaño',
        },
        {
          field: 'type',
          header: 'Tipo',
        },
      ];
    });
  }

  onFileSelect(event: FileSelectEvent) {
    const files = event.files;
    this.changeStateButton();
    this.validateAndAssignFiles(files, true);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onClear() {
    this.fileUpload.files = [];
    this.changeStateButton();
  }

  customContentTemplate1 = (file: any): SafeHtml => {
    const imageUrl =
      file.objectURL?.changingThisBreaksApplicationSecurity ||
      URL.createObjectURL(file);

    const html = `
        <div class="image-container" style="width: 100px; height: 50px; overflow: hidden; border-radius: 4px;">
          <img src="${imageUrl}" alt="Imagen" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>
      `;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  };

  deleteTest(file: File) {
    this.fileUpload.files = this.fileUpload.files.filter((f) => f !== file);
    if (!this.fileUpload.files.length) {
      this.fileUpload.clear();
      this.changeStateButton();
    } else {
      this.arrayFileWhitOutChange = filterFiles(
        this.fileUpload.files,
        this.arrayFileWhitOutChange
      );
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      const files = event.dataTransfer.files;
      this.validateAndAssignFiles(files, false);
    }
  }

  validateAndAssignFiles(files: FileList | File[], replace: boolean = false) {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        this.changeStateButton();
        const isDuplicate = this.isFileDuplicate(file);
        if (!isDuplicate) {
          validFiles.push(file);
        }
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      this.showErrorMessages(invalidFiles);
    }

    if (validFiles.length > 0) {
      if (replace) {
        this.fileUpload.files = validFiles;
      } else {
        this.fileUpload.files = [...this.fileUpload.files, ...validFiles];
        this.arrayFileWhitOutChange = [...this.arrayFileWhitOutChange, ...validFiles];
      }
      this.myfile = this.fileUpload.files;
      this.changeStateButton();
    }
  }

  isFileDuplicate(file: File): boolean {
    return this.fileUpload.files.some(
      (f) =>
        f.name === file.name &&
        f.size === file.size &&
        f.lastModified === file.lastModified
    );
  }

  showErrorMessages(invalidFiles: string[]) {
    const bulletPoints = invalidFiles
      .map((file) => `<li>${file}</li>`)
      .join('');
    this.errorMessage = `
        Los siguientes archivos no son imágenes:
        <ul>${bulletPoints}</ul>
      `;
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  onUpload(event: any) {
    const dialogRef = this.confirmationService.openConfirmation();
    dialogRef.onClose.subscribe((data: boolean | null | undefined) => {
      if (data) {
        this.downloadImagePdfService.uploadFilesImages(
          this.tableGenericComponent?.dataTable
        );
        this.fileUpload.clear();
        this.changeStateButton();
      }
    });
  }

  organizeRow(event: File[]) {
    if (!this.orderTable) this.arrayFileWhitOutChange = this.fileUpload.files;
    this.fileUpload.files = event;
    this.orderTable = true;
  }
  restartTable() {
    if (this.orderTable) this.fileUpload.files = this.arrayFileWhitOutChange;
  }
  changeStateButton() {
    this.buttons.buttons[0].disabled = !this.fileUpload?.files?.length;
    if (!this.fileUpload?.files?.length) {
      this.orderTable = false;
      this.arrayFileWhitOutChange = [];
    }
  }
}
