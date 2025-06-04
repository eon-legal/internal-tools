import { Injectable } from '@angular/core';
import { PDFDocument } from 'pdf-lib';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class PdfMergeService {
  constructor(private toastr: ToastrService) {}

  async mergeAndOpenPdfs(pdfFiles: File[]): Promise<void> {
    if (!pdfFiles || pdfFiles.length === 0) {
      this.toastr.warning(
        'No se han seleccionado archivos PDF para fusionar',
        'Advertencia'
      );
      return;
    }

    const invalidFiles = pdfFiles.filter(
      (file) => file.type !== 'application/pdf'
    );

    if (invalidFiles.length > 0) {
      this.toastr.warning(
        `Se encontraron ${invalidFiles.length} archivos que no son PDF`,
        'Advertencia'
      );
      pdfFiles = pdfFiles.filter((file) => file.type === 'application/pdf');

      if (pdfFiles.length === 0) {
        this.toastr.error(
          'No hay archivos PDF válidos para fusionar',
          'Error'
        );
        return;
      }
    }

    try {
      const mergedPdf = await PDFDocument.create();

      await Promise.all(
        pdfFiles.map(async (file) => {
          try {
            const pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(new Uint8Array(pdfBytes));
            const pages = await mergedPdf.copyPages(
              pdfDoc,
              pdfDoc.getPageIndices()
            );
            pages.forEach((page) => mergedPdf.addPage(page));
          } catch (error) {
            throw new Error(`Error al procesar el archivo: ${file.name}`);
          }
        })
      );

      const mergedPdfBytes = await mergedPdf.save();
      const pdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const newWindow = window.open(pdfUrl, '_blank');

      if (!newWindow || newWindow.closed) {
        this.toastr.warning(
          'El navegador bloqueó la ventana emergente. Por favor, habilite popups para esta página.',
          'Advertencia'
        );
        return;
      }

      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 1000);

    } catch (error) {
      this.toastr.error(
        'Error al fusionar los PDFs. Por favor, intente nuevamente.',
        'Error'
      );
      
    }
  }
}