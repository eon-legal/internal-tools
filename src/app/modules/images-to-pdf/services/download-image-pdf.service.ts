import { inject, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { jsPDF } from 'jspdf';

@Injectable({
  providedIn: 'root',
})
export class DownloadImagePdfService {
  private readonly toastr = inject(ToastrService);

  uploadFilesImages(files: File[]) {
    // Validación de array vacío
    if (!files || files.length === 0) {
      this.toastr.warning(
        'No se han seleccionado imágenes para generar el PDF',
        'Advertencia'
      );
      return;
    }

    // Validación de tipos de archivo (solo imágenes)
    const validImageTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
    ];
    const invalidFiles = files.filter(
      (file) => !validImageTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      this.toastr.warning(
        `Se encontraron ${invalidFiles.length} archivos que no son imágenes`,
        'Advertencia'
      );
      // Opcional: Filtrar solo las imágenes válidas para continuar
      files = files.filter((file) => validImageTypes.includes(file.type));

      // Si después de filtrar no quedan imágenes
      if (files.length === 0) {
        this.toastr.error(
          'No hay imágenes válidas para generar el PDF',
          'Error'
        );
        return;
      }
    }

    // Crea un nuevo documento PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Procesa cada imagen
    Promise.all(
      files.map(async (file, index) => {
        try {
          const base64Image = await this.toBase64(file);
          const { width, height } = await this.getImageDimensions(base64Image);

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
        } catch (error) {
          throw new Error(`Error al procesar la imagen: ${file.name}`);
        }
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
        /*setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 1000);*/
      })
      .catch(() => {
        this.toastr.error(
          'Error al generar el PDF. Por favor, intente nuevamente.',
          'Error'
        );
      });
  }
  toBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
  getImageDimensions(
    base64: string
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = () => {
        // Si hay error al cargar la imagen, usar dimensiones por defecto
        resolve({ width: 100, height: 100 });
      };
      img.src = base64;
    });
  }
}
