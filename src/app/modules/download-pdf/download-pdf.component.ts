import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import jsPDF from 'jspdf';
import { ButtonModule } from 'primeng/button';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { ToastrService } from 'ngx-toastr';
import { TableGenericComponent } from '../../shared/components/table-generic/table-generic.component';
import { HeaderTable } from '../../shared/interfaces/header-table';
import {
  ButtonOperation,
  FormatOptions,
} from '../../shared/interfaces/buttons';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-download-pdf',
  standalone: true,
  imports: [FileUploadModule, ButtonModule, TableModule, TableGenericComponent, NgOptimizedImage],
  templateUrl: './download-pdf.component.html',
  styleUrl: './download-pdf.component.scss',
})
export class DownloadPdfComponent implements AfterViewInit {
  @ViewChild('imageTemplate') imageTemplate!: TemplateRef<any>;
  listPagination = [5, 10, 20];
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  acceptedFiles: string = '.jpg,.jpeg,.png,.gif';
  messagesFiles: string = 'Solo se aceptan imágenes.';
  myFiles: File[] = [];
  uploadedFiles: any[] = [];
  toastr: ToastrService = inject(ToastrService);
  cd: ChangeDetectorRef = inject(ChangeDetectorRef);

  headerData: HeaderTable<File>[] = [
    /*{
      field: 'name',
      header: 'Nombre',
      content: this.imageTemplate, // Usar el template para la columna "Nombre"
    },
    {
      field: 'size',
      header: 'Tamaño',
    },
    {
      field: 'type',
      header: 'Tipo',
    },*/
  ];
  operation: ButtonOperation<File>[] = [
    {
      icon: 'pi pi-trash',
      severity: 'danger',
      action: (row: File) => this.deleteTest(row),
    },
  ];

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
          content: this.imageTemplate,
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

  uploadFilesImages(event: { files: File[] }) {
    const files: File[] = event.files;

    // Crea un nuevo documento PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Función para convertir archivo a base64
    const toBase64 = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

    // Función para obtener dimensiones de imagen
    const getImageDimensions = (
      base64: string
    ): Promise<{ width: number; height: number }> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height,
          });
        };
        img.src = base64;
      });
    };

    // Procesa cada imagen
    Promise.all(
      files.map(async (file, index) => {
        const base64Image = await toBase64(file);
        const { width, height } = await getImageDimensions(base64Image);

        // Añade una página nueva
        if (index > 0) {
          doc.addPage();
        }

        // Calcula dimensiones para mantener la proporción
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 10; // márgenes

        // Calcula el factor de escala para ajustar la imagen
        const scaleWidth = (pageWidth - margin * 2) / width;
        const scaleHeight = (pageHeight - margin * 2) / height;
        const scale = Math.min(scaleWidth, scaleHeight);

        // Calcula nuevas dimensiones
        const newWidth = width * scale;
        const newHeight = height * scale;

        // Calcula posición centrada
        const x = (pageWidth - newWidth) / 2;
        const y = (pageHeight - newHeight) / 2;

        // Añade la imagen
        doc.addImage(
          base64Image,
          file.type.split('/')[1].toUpperCase(), // Obtiene el formato de la imagen
          x,
          y,
          newWidth,
          newHeight
        );

        // Agregar pie de página con número de página
        const pageNumber = index + 1;
        const totalPages = files.length;

        // Configura el estilo del pie de página
        doc.setFontSize(10);
        doc.setTextColor(100);

        // Calcula la posición centrada para el pie de página
        const pageNumberText = `Página ${pageNumber} de ${totalPages}`;
        const textWidth = doc.getTextDimensions(pageNumberText).w;
        const centerX = (pageWidth - textWidth) / 2;

        // Posiciona el pie de página cerca del borde inferior
        doc.text(pageNumberText, centerX, pageHeight - 10);
      })
    )
      .then(() => {
        // Guarda el PDF
        const date = new Date();
        const filename = `doc${date.getFullYear()}${
          date.getMonth() + 1 >= 10
            ? date.getMonth() + 1
            : `0${date.getMonth() + 1}`
        }${date.getDate() >= 10 ? date.getDate() : `0${date.getDate()}`}${
          date.getHours() >= 10 ? date.getHours() : `0${date.getHours()}`
        }${
          date.getMinutes() >= 10 ? date.getMinutes() : `0${date.getMinutes()}`
        }${
          date.getSeconds() >= 10 ? date.getSeconds() : `0${date.getSeconds()}`
        }.pdf`;

        doc.save(filename);
        this.myFiles = [];
        this.fileUpload.clear();
      })
      .catch(() => {
        this.toastr.error('Error procesando imágenes', 'Error');
        this.myFiles = [];
        this.fileUpload.clear();
      });
  }
  deleteTest(file: File) {
    this.fileUpload.files = this.fileUpload.files.filter((f) => f !== file);
    if (!this.fileUpload.files.length) this.fileUpload.clear();
    this.cd.detectChanges();
    /*if (index !== -1) {
      this.fileUpload.remove(index);
      if (!this.fileUpload.files.length) this.fileUpload.clear();
      this.cd.detectChanges();
    }*/
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
  extension(data: string) {
    const sub = 'image/';
    if (data.includes(sub)) {
      return data.split(sub)[1].toLocaleUpperCase();
    }
    return 'N/A';
  }
}
