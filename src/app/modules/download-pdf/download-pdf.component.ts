import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import { ButtonModule } from 'primeng/button';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { FileSizePipe } from '../../core/directives/file-size/file-size.pipe';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-download-pdf',
  standalone: true,
  imports: [FileSizePipe, FileUploadModule, ButtonModule, TableModule],
  templateUrl: './download-pdf.component.html',
  styleUrl: './download-pdf.component.scss',
})
export class DownloadPdfComponent {
  listPagination = [5, 10, 20];
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  acceptedFiles: string = '.jpg,.jpeg,.png,.gif';
  messagesFiles: string = 'Solo se aceptan imágenes.';
  myFiles: File[] = [];
  products = [
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'bamboo-watch.jpg',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'INSTOCK',
      rating: 5,
    },
  ];
  uploadedFiles: any[] = [];
  toastr: ToastrService = inject(ToastrService);
  cd: ChangeDetectorRef = inject(ChangeDetectorRef);

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
