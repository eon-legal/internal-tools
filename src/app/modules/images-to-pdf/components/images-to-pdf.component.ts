import {
  AfterViewInit,
  Component,
  inject,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { TableGenericComponent } from '../../../shared/components/table-generic/table-generic.component';
import { HeaderTable } from '../../../shared/interfaces/header-table';
import {
  ButtonGenericInterface,
  FormatOptions,
} from '../../../shared/interfaces/buttons';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DownloadImagePdfService } from '../services/download-image-pdf.service';
import { ConfirmationService } from '../../../shared/services/confirmation/confirmation.service';
import { ButtonGenericComponent } from '../../../shared/components/button-generic/button-generic.component';
import { filterFiles } from '../utils/filter-file';
import { MessagesComponent } from '../../../shared/components/messages/messages.component';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload.component';
import { DragDropAreaComponent } from '../../../shared/components/drag-drop-area/drag-drop-area.component';

@Component({
  selector: 'app-images-to-pdf',
  standalone: true,
  imports: [
    FileUploadComponent,
    MessagesComponent,
    TableGenericComponent,
    ButtonGenericComponent,
    DragDropAreaComponent,
  ],
  templateUrl: './images-to-pdf.component.html',
  styleUrl: './images-to-pdf.component.scss',
})
export class ImagesToPdfComponent implements AfterViewInit {
  orderTable: boolean = false;
  arrayFileWhitOutChange: File[] = [];
  @ViewChild('fileUploadComponent') fileUploadComponent!: FileUploadComponent;
  buttons: ButtonGenericInterface = {
    css: 'flex flex-column md:flex-row md:justify-content-end gap-2',
    buttons: [
      {
        id: 1,
        icon: 'pi pi-check',
        label: 'Restablecer Orden Inicial Archivos',
        severity: 'primary',
        disabled: !this.fileUploadComponent?.getFiles()?.length,
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
  acceptedFiles: string[] = ['jpg', 'jpeg', 'png', 'gif'];
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
        action: (row: File) => this.deleteItemRow(row),
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

  errorMessage: string = '';

  sanitizer: DomSanitizer = inject(DomSanitizer);
  downloadImagePdfService: DownloadImagePdfService = inject(
    DownloadImagePdfService
  );

  onDrop(event: FileList) {
    const files = Array.from(event);
    this.validateAndAssignFiles(files, false);
  }

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

  onFileSelect(files: File[]) {
    this.changeStateButton();
    this.validateAndAssignFiles(files, true);
  }

  onClear() {
    this.fileUploadComponent.setFiles([]);
    this.changeStateButton();
  }

  onUpload() {
    const dialogRef = this.confirmationService.openConfirmation();
    dialogRef.onClose.subscribe((data: boolean | null | undefined) => {
      if (data) {
        this.downloadImagePdfService.uploadFilesImages(
          this.tableGenericComponent?.dataTable
        );
        this.fileUploadComponent.clearFiles();
        this.changeStateButton();
      }
    });
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

  deleteItemRow(file: File) {
    this.fileUploadComponent.setFiles(
      this.fileUploadComponent.getFiles().filter((f) => f !== file)
    );
    if (!this.fileUploadComponent.getFiles().length) {
      this.fileUploadComponent.clearFiles();
      this.changeStateButton();
    } else {
      this.arrayFileWhitOutChange = filterFiles(
        this.fileUploadComponent.getFiles(),
        this.arrayFileWhitOutChange
      );
    }
  }

  validateAndAssignFiles(
    files: FileList | File[] | null,
    replace: boolean = false
  ) {
    if (!files) return;
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    const filesArray = Array.isArray(files) ? files : Array.from(files);
    filesArray.forEach((file) => {
      if (
        file.type.startsWith('image/') &&
        this.hasAllowedExtension(file.type.split('/')[1])
      ) {
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
        this.fileUploadComponent.setFiles(validFiles);
      } else {
        const currentFiles = this.fileUploadComponent.getFiles();
        this.fileUploadComponent.setFiles([...currentFiles, ...validFiles]);
        this.arrayFileWhitOutChange = [
          ...this.arrayFileWhitOutChange,
          ...validFiles,
        ];
      }
      this.myfile = this.fileUploadComponent.getFiles();
      this.changeStateButton();
    }
  }

  isFileDuplicate(file: File): boolean {
    return this.fileUploadComponent
      .getFiles()
      .some(
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
        Los siguientes archivos no son imágenes permitidas:
        <ul>${bulletPoints}</ul>
      `;
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  hasAllowedExtension(extension: string): boolean {
    return this.acceptedFiles.includes(extension);
  }
  organizeRow(event: File[]) {
    if (!this.orderTable)
      this.arrayFileWhitOutChange = this.fileUploadComponent.getFiles();
    this.fileUploadComponent.setFiles(event);
    this.orderTable = true;
  }
  restartTable() {
    if (this.orderTable)
      this.fileUploadComponent.setFiles(this.arrayFileWhitOutChange);
  }
  changeStateButton() {
    this.buttons.buttons[0].disabled =
      !this.fileUploadComponent?.getFiles()?.length;
    if (!this.fileUploadComponent?.getFiles()?.length) {
      this.orderTable = false;
      this.arrayFileWhitOutChange = [];
    }
  }
}
