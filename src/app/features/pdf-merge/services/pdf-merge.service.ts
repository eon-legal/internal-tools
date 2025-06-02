import { Injectable } from '@angular/core';
import { PDFDocument } from 'pdf-lib';

@Injectable({
  providedIn: 'root',
})
export class PdfMergeService {
  async mergePdfs(pdfFiles: File[]): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create();

    // Procesamiento en paralelo para mejor rendimiento
    await Promise.all(
      pdfFiles.map(async (file) => {
        const pdfBytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(new Uint8Array(pdfBytes));
        const pages = await mergedPdf.copyPages(
          pdfDoc,
          pdfDoc.getPageIndices()
        );
        pages.forEach((page) => mergedPdf.addPage(page));
      })
    );

    return mergedPdf.save();
  }

  downloadPdf(mergedPdf: Uint8Array, filename: string = 'merged.pdf'): void {
    const blob = new Blob([mergedPdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
}
