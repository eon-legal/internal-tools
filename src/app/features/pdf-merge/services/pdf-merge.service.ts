import { Injectable } from '@angular/core';
import { PDFDocument } from 'pdf-lib';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class PdfMergeService {
  constructor(private toastr: ToastrService) {}

  /**
   * Merges multiple PDF files into a single PDF document
   * @param pdfFiles - Array of PDF files to merge
   * @returns Promise that resolves with the merged PDF as Uint8Array
   */
  async mergePdfs(pdfFiles: File[]): Promise<Uint8Array> {
    if (!pdfFiles || pdfFiles.length === 0) {
      this.toastr.warning('No se han seleccionado archivos PDF para fusionar', 'Advertencia');
      throw new Error('No PDF files provided');
    }

    const mergedPdf = await PDFDocument.create();

    await Promise.all(
      pdfFiles.map(async (file) => {
        if (file.type !== 'application/pdf') {
          this.toastr.warning(`El archivo ${file.name} no es un PDF válido`, 'Advertencia');
          return;
        }

        try {
          const pdfBytes = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(new Uint8Array(pdfBytes));
          const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
          pages.forEach((page) => mergedPdf.addPage(page));
        } catch (error) {
          this.toastr.error(`Error al procesar el archivo ${file.name}`, 'Error');
          throw error;
        }
      })
    );

    return mergedPdf.save();
  }

  /**
   * Opens the merged PDF in a new browser tab with proper error handling
   * @param mergedPdf - The merged PDF as Uint8Array
   */
  async openPdfInNewTab(mergedPdf: Uint8Array): Promise<void> {
    try {
      const blob = new Blob([mergedPdf], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(blob);

      // Try to open in new tab
      const newWindow = window.open(pdfUrl, '_blank', 'noopener,noreferrer');

      if (!newWindow || newWindow.closed) {
        throw new Error('Popup blocked by browser');
      }

      // Cleanup when the new window loads
      newWindow.addEventListener('load', () => {
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 3000);
      }, { once: true });

    } catch (error) {
      this.toastr.error('No se pudo abrir el PDF. Por favor, intente nuevamente.', 'Error');
      throw error;
    }
  }

  /**
   * Alternative method that combines merging and opening in one step
   * @param pdfFiles - Array of PDF files to merge
   */
  async mergeAndOpenPdfs(pdfFiles: File[]): Promise<void> {
    try {
      const mergedPdf = await this.mergePdfs(pdfFiles);
      await this.openPdfInNewTab(mergedPdf);
    } catch (error) {
      this.toastr.error('Error al procesar los archivos PDF', 'Error');
      throw error;
    }
  }
}