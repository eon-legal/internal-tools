import { inject, Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root',
})
export class DownloadImagePdfService {
  toastr: ToastrService = inject(ToastrService);

  uploadFilesImages(files: File[]) {
    //const files: File[] = event.files;

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
        // Genera un Blob del PDF
        const pdfBlob = doc.output('blob');

        // Crea una URL temporal para el Blob
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Abre el PDF en una nueva pestaña
        window.open(pdfUrl, '_blank');

        // Limpia la URL temporal después de abrir el PDF
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 1000); // Revocar la URL después de 1 segundo
      })
      .catch(() => {
        this.toastr.error('Error procesando imágenes', 'Error');
      });
  }
}
