import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

@Injectable({
  providedIn: 'root',
})
export class PdfService {

  generarPDFConMultiplesHojas(
    datos: any[],
    columnas: string[],
    cabeceras: string[],
    titulo: string = ''
  ): void {
    const doc = new jsPDF('p', 'pt');
    const pageSize = doc.internal.pageSize;
    const margin = 40;
    let yPos = margin;

    // Agregar título
    if (titulo) {
      doc.setFontSize(18);
      doc.text(titulo, pageSize.width / 2, yPos, { align: 'center' });
      yPos += 40;
    }

    // Configuración de la tabla
    /*
    const options: any = {
      startY: yPos,
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: yPos },
      didDrawPage: (data: any) => {
        // Agregar cabecera en cada nueva página
        doc.autoTable({
          head: [cabeceras],
          body: [],
          styles: { minCellHeight: 0 },
          margin: { top: margin },
          willDrawCell: () => {},
        });
      },
    };*/

    // Convertir datos a formato compatible
    const body = datos.map((row) => columnas.map((col) => row[col] || ''));

    // Generar tabla
    /*(doc as any).autoTable({
      head: [cabeceras],
      body: body,
      ...options,
    });*/

    // Guardar PDF
    doc.save('documento.pdf');
  }
}
