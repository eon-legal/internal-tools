import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  TemplateRef,
  ViewChild,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { TableGenericComponent } from '../../../shared/components/table-generic/table-generic.component';
import { HeaderTable } from '../../../shared/interfaces/header-table';
import {
  ButtonGenericInterface,
  FormatOptions,
} from '../../../shared/interfaces/buttons';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DownloadImagePdfService } from '../services/download-image-pdf.service';

@Component({
  selector: 'app-images-to-pdf',
  standalone: true,
  imports: [FileUploadModule, ButtonModule, TableModule, TableGenericComponent],
  templateUrl: './images-to-pdf.component.html',
  styleUrl: './images-to-pdf.component.scss',
})
export class ImagesToPdfComponent implements AfterViewInit {
  @ViewChild('imageTemplate') imageTemplate!: TemplateRef<any>;
  listPagination = [5, 10, 20];
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  acceptedFiles: string = '.jpg,.jpeg,.png,.gif';
  messagesFiles: string = 'Solo se aceptan imágenes.';
  myFiles: File[] = [];
  uploadedFiles: any[] = [];
  cd: ChangeDetectorRef = inject(ChangeDetectorRef);
  sanitizer: DomSanitizer = inject(DomSanitizer);
  downloadImagePdfService: DownloadImagePdfService = inject(
    DownloadImagePdfService
  );
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
  }; /* { 
   buttons: {
    [
      {icon: 'pi pi-trash',
      severity: 'danger',
      action: (row: File) => this.deleteTest(row)}
   ]
    },
  };*/

  ngAfterViewInit() {
    setTimeout(() => {
      // Pre-generar las URLs de las imágenes
      // Pre-generar las URLs de las imágenes
      this.fileUpload.files.forEach((file) => {
        (file as any).imageUrl = this.getImageUrl(file);
      });
      this.headerData = [
        {
          field: 'text',
          header: 'Imagen',
          customContent: this.customContentTemplate1,
        },
        {
          field: 'name',
          header: 'Nombre',
          //content: this.imageTemplate,
        },
        {
          field: 'size',
          header: 'Tamaño',
          //content: this.sizeTemplate,
        },
        {
          field: 'type',
          header: 'Tipo',
        },
      ];
    });
  }

  //24289	image/png
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
  getImageUrl(file: File): string {
    return URL.createObjectURL(file); // Genera una URL válida para el archivo TITO
  }

  downloadFile(event: { files: File[] }) {
    this.downloadImagePdfService.uploadFilesImages(event);
    this.myFiles = [];
    this.fileUpload.clear();
  }

  customContentTemplate1 = (file: any): SafeHtml => {
    const html = `
    <div class="image-container" style="width: 100px; height: 50px; overflow: hidden; border-radius: 4px;">
      <img src="${file.objectURL.changingThisBreaksApplicationSecurity}" alt="Imagen" style="width: 100%; height: 100%; object-fit: contain;" />
    </div>
  `;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  };

  deleteTest(file: File) {
    this.fileUpload.files = this.fileUpload.files.filter((f) => f !== file);
    if (!this.fileUpload.files.length) this.fileUpload.clear();
    this.cd.detectChanges();
  }
  deletefile(file: File, event: Event) {
    const index = this.fileUpload.files.findIndex(
      (f) =>
        f.name === file.name &&
        f.size === file.size &&
        f.lastModified === file.lastModified
    );
    if (index !== -1) {
      this.fileUpload.remove(event, index);
      if (!this.fileUpload.files.length) this.fileUpload.clear();
      this.cd.detectChanges();
    }
  }
}
