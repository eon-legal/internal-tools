import { Injectable } from '@angular/core';
import { PdfMakeWrapper, Txt, Img } from 'pdfmake-wrapper';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { SecondForm } from '../interfaces/second-form';
import { FisrtForm } from '../interfaces/first-form';
import { DataInvoicesTable } from '../interfaces/data-invoices-table';
import { formatDateByParams } from '../utils/format-date/format-date';
import { DataInvoicesConstant } from '../constants/data-invoices';
import { UM } from '../constants/um';

// Configura las fuentes para pdfmake
pdfMake.vfs = pdfFonts.pdfMake.vfs;

/**
 * CreateInvoicePdfService is a service that generates PDF invoices using the pdfmake library.
 * It provides methods to create, open, and download PDF invoices with dynamic content.
 */
@Injectable({
  providedIn: 'root', // Makes the service available application-wide
})
export class CreateInvoicePdfService {
  /**
   * Generates and opens a PDF invoice with the provided data.
   * @param nameAddressOrPassport - A tuple containing the name and address/passport information.
   * @param endPage - The second form data containing destination and bank details.
   * @param rightInvoice - The first form data containing invoice details.
   * @param tableData - The table data containing invoice line items.
   */
  async newGeneratePDFInvoices(
    nameAddressOrPassport: [string, string],
    endPage: SecondForm,
    rightInvoice: FisrtForm,
    tableData: DataInvoicesTable[]
  ) {
    const pdf = await this.buildPDF(nameAddressOrPassport, endPage, rightInvoice, tableData);
    pdf.create().open();
  }

  /**
   * Generates and downloads a PDF invoice with the provided data.
   * @param nameAddressOrPassport - A tuple containing the name and address/passport information.
   * @param endPage - The second form data containing destination and bank details.
   * @param rightInvoice - The first form data containing invoice details.
   * @param tableData - The table data containing invoice line items.
   * @param filename - Optional filename for the downloaded PDF (defaults to invoice number)
   */
  async downloadPDFInvoice(
    nameAddressOrPassport: [string, string],
    endPage: SecondForm,
    rightInvoice: FisrtForm,
    tableData: DataInvoicesTable[],
    filename?: string
  ) {
    const pdf = await this.buildPDF(nameAddressOrPassport, endPage, rightInvoice, tableData);
    const downloadName = filename || `Invoice-${rightInvoice.numberInvoice}.pdf`;
    pdf.create().download(downloadName);
  }

  /**
   * Builds the PDF document structure with the provided data.
   * @param nameAddressOrPassport - A tuple containing the name and address/passport information.
   * @param endPage - The second form data containing destination and bank details.
   * @param rightInvoice - The first form data containing invoice details.
   * @param tableData - The table data containing invoice line items.
   * @returns PdfMakeWrapper instance ready to be created
   */
  private async buildPDF(
    nameAddressOrPassport: [string, string],
    endPage: SecondForm,
    rightInvoice: FisrtForm,
    tableData: DataInvoicesTable[]
  ) {
    const pdf = new PdfMakeWrapper();

    // Configuración de la página
    pdf.pageMargins([40, 60, 40, 60]); // Reduce el margen superior para subir el contenido
    pdf.defaultStyle({
      fontSize: 10,
    });

    // Logo centrado (subido hacia arriba)
    pdf.add(
      await new Img('assets/logo.png')
        .fit([200, 100])
        .alignment('center')
        .margin([0, 0, 0, 10]) // Reduce el margen inferior del logo
        .build()
    );

    // 3. Contenido principal en columnas
    pdf.add({
      table: {
        widths: ['*', 250], // Columna izquierda flexible, derecha fija
        body: [
          [
            // Columna izquierda (ORDENANTE:)
            {
              stack: [
                new Txt('ORDENANTE:').bold().fontSize(14).margin([0, 0, 0, 10]).end,
                new Txt(
                  `${nameAddressOrPassport[0]}\nNIE: ${nameAddressOrPassport[1]}`
                ).margin([0, 0, 0, 5]).end,
              ],
            },
            // Columna derecha (Cuadro negro)
            {
              text: `FACTURA\nFactura # ${rightInvoice.numberInvoice}\n${
                this.formatDateSpanish(rightInvoice.date)
              }`,
              fillColor: '#000000',
              color: '#ffffff',
              fontSize: 12,
              alignment: 'center',
              margin: 10,
              lineHeight: 1.4,
            },
          ],
        ],
      },
      layout: {
        paddingLeft: () => 0,
        paddingRight: () => 0,
        hLineWidth: () => 0, // Elimina las líneas de la tabla
        vLineWidth: () => 0,
      },
    });

    // Tabla
    pdf.add({
      table: {
        headerRows: 1,
        widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
        body: [
          [
            { text: 'ID', style: 'tableHeader' },
            { text: 'DESCRIPCIÓN', style: 'tableHeader' },
            { text: 'CANT', style: 'tableHeader' },
            { text: 'S.TOTAL', style: 'tableHeader' },
            { text: '% IVA', style: 'tableHeader' },
            { text: 'TOTAL', style: 'tableHeader' },
          ].map((header) => ({
            ...header,
            fillColor: '#000000',
            color: '#FFFFFF',
          })),
          ...tableData.map((item, index) => [
            {
              text: item.id,
              style: 'tableCell',
              border:
                index >= tableData.length - 2
                  ? [false, false, false, false]
                  : undefined,
            },
            {
              text: item.description,
              wordWrap: true,
              style: 'tableCell',
              border:
                index >= tableData.length - 2
                  ? [false, false, false, false]
                  : undefined,
            },
            {
              text: item?.qtt || '1',
              style: 'tableCell',
              border:
                index >= tableData.length - 2
                  ? [false, false, false, false]
                  : undefined,
            },
            {
              text: ` ${
                item.perCentIva === DataInvoicesConstant.IVA ||
                item.perCentIva === DataInvoicesConstant.TOTAL
                  ? ''
                  : item.sTotal
              }  ${
                item.perCentIva === DataInvoicesConstant.IVA ||
                item.perCentIva === DataInvoicesConstant.TOTAL
                  ? ''
                  : UM.EU
              }`,
              style: 'tableCell',
              border:
                index >= tableData.length - 2
                  ? [false, false, false, false]
                  : undefined,
            },
            {
              text: `${item.perCentIva} ${
                item.perCentIva === DataInvoicesConstant.IVA ||
                item.perCentIva === DataInvoicesConstant.TOTAL
                  ? ''
                  : UM.PER_CENT
              }`,
              style: 'tableCell',
              border:
                index >= tableData.length - 2
                  ? [true, true, true, true]
                  : undefined,
            },
            {
              text: `${item.total} ${UM.EU}`,
              fillColor: index === tableData.length - 1 ? '#000000' : undefined,
              color: index === tableData.length - 1 ? '#FFFFFF' : undefined,
              border:
                index >= tableData.length - 2
                  ? [true, true, true, true]
                  : undefined,
            },
          ]),
        ],
      },
      layout: {
        hLineWidth: () => 1, // Bordes horizontales globales
        vLineWidth: () => 0.8, // Bordes verticales globales
        hLineColor: '#0066CC', // Color de los bordes horizontales
        vLineColor: '#0066CC', // Color de los bordes verticales
      },
      margin: [0, 10, 0, 20],
    });

    const fromElements = [
      {
        text: 'FROM:',
        style: 'fromHeader',
        margin: [0, 20, 0, 10],
      },
      {
        text: `Name: ${endPage.nameDestination}`,
        style: 'fromItem',
        margin: [0, 0, 0, 5],
      },
      {
        text: `Account (IBAN): ${endPage.accountDestination}`,
        style: 'fromItem',
        margin: [0, 0, 0, 5],
        wordWrap: true,
      },
      {
        text: `Address: ${endPage.addressDestination}`,
        style: 'fromItem',
        margin: [0, 0, 0, 5],
        wordWrap: true,
      },
      {
        text: `Bank Name: ${endPage.nameBank}`,
        style: 'fromItem',
        margin: [0, 0, 0, 5],
        wordWrap: true,
      },
      {
        text: `Bank Address: ${endPage.addressBank}`,
        style: 'fromItem',
        margin: [0, 0, 0, 5],
        wordWrap: true,
      },
      {
        text: `NIF: ${endPage.nif}`,
        style: 'fromItem',
        margin: [0, 0, 0, 10],
        wordWrap: true,
      },
    ];

    pdf.add({
      stack: fromElements,
      unbreakable: false,
      pageBreak: 'avoid',
      id: 'fromSection',
    });

    // Estilos válidos
    pdf.styles({
      fromHeader: {
        bold: true,
        fontSize: 14,
      },
      fromItem: {
        fontSize: 10,
        lineHeight: 1.1,
      },
    });

    return pdf;
  }

  /**
   * Formats a date in Spanish format (e.g., "Fecha: Noviembre 17, 2025")
   */
  private formatDateSpanish(date: Date | [Date, Date] | null): string {
    if (!date) return '';

    const spanishMonths = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const formatSingleDate = (d: Date): string => {
      if (isNaN(d.getTime())) return '';
      const month = spanishMonths[d.getMonth()];
      const day = d.getDate();
      const year = d.getFullYear();
      return `${month} ${day}, ${year}`;
    };

    if (Array.isArray(date)) {
      const [first, second] = date;
      return `Fecha: ${formatSingleDate(first)} - ${formatSingleDate(second)}`;
    }

    return `Fecha: ${formatSingleDate(date)}`;
  }
}
