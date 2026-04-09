import { Injectable } from '@angular/core';
import { PdfMakeWrapper, Txt, Img } from 'pdfmake-wrapper';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { SecondForm } from '../interfaces/second-form';
import { FisrtForm } from '../interfaces/first-form';
import { DataInvoicesTable } from '../interfaces/data-invoices-table';
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
    const downloadName = filename || `${rightInvoice.numberInvoice}.pdf`;
    pdf.create().download(downloadName);
  }

  /**
   * Generates and returns a PDF invoice as a Blob.
   * @param nameAddressOrPassport - A tuple containing the name and address/passport information.
   * @param endPage - The second form data containing destination and bank details.
   * @param rightInvoice - The first form data containing invoice details.
   * @param tableData - The table data containing invoice line items.
   * @returns Promise<Blob> containing the generated PDF
   */
  async getPDFBlobInvoice(
    nameAddressOrPassport: [string, string],
    endPage: SecondForm,
    rightInvoice: FisrtForm,
    tableData: DataInvoicesTable[]
  ): Promise<Blob> {
    const pdf = await this.buildPDF(nameAddressOrPassport, endPage, rightInvoice, tableData);
    return new Promise((resolve) => {
      pdf.create().getBlob((blob: Blob) => {
        resolve(blob);
      });
    });
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
    // Logo height: 1.38 cm = ~39 pt (1 cm ≈ 28.35 pt)
    pdf.add(
      await new Img('assets/logo.png')
        .fit([200, 39])
        .alignment('center')
        .margin([0, 0, 0, 10])
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
                { text: nameAddressOrPassport[0], margin: [0, 0, 0, 2] },
                {
                  text: [
                    { text: `${rightInvoice.identificationType || 'DNI'}: `, bold: true },
                    { text: nameAddressOrPassport[1] },
                  ],
                  margin: [0, 0, 0, 5],
                },
              ],
            },
            // Columna derecha (Cuadro negro)
            {
              stack: [
                { text: 'FACTURA', bold: true, fontSize: 14 },
                { text: `Factura # ${rightInvoice.numberInvoice}` },
                { text: this.formatDateSpanish(rightInvoice.date) },
              ],
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

    // Tabla - Build using the new specification
    pdf.add(this.buildInvoiceTable(tableData));

    const fromElements = [
      {
        text: 'FROM:',
        style: 'fromHeader',
        margin: [0, 20, 0, 10],
      },
      {
        text: [{ text: 'Name: ' }, { text: endPage.nameDestination, bold: true }],
        style: 'fromItem',
        margin: [0, 0, 0, 5],
      },
      {
        text: [{ text: 'Account (IBAN): ' }, { text: endPage.accountDestination, bold: true }],
        style: 'fromItem',
        margin: [0, 0, 0, 5],
      },
      {
        text: [{ text: 'Address: ' }, { text: endPage.addressDestination, bold: true }],
        style: 'fromItem',
        margin: [0, 0, 0, 5],
      },
      {
        text: [{ text: 'Bank Name: ' }, { text: endPage.nameBank, bold: true }],
        style: 'fromItem',
        margin: [0, 0, 0, 5],
      },
      {
        text: [{ text: 'Bank Address: ' }, { text: endPage.addressBank, bold: true }],
        style: 'fromItem',
        margin: [0, 0, 0, 5],
      },
      {
        text: [{ text: 'NIF: ' }, { text: endPage.nif, bold: true }],
        style: 'fromItem',
        margin: [0, 0, 0, 10],
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
        lineHeight: 0.5,
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

  /**
   * Formats a number as currency with comma as decimal separator and euro sign.
   * E.g., 206.61 -> "206,61 €"
   */
  private formatCurrency(value: number | string): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '';
    // Format with 2 decimal places, replace dot with comma, add euro sign
    return `${numValue.toFixed(2).replace('.', ',')} ${UM.EU}`;
  }

  /**
   * Builds the invoice items table with the specified styling.
   * Grid layout: 6 columns (ID, DESCRIPCIÓN, CANT, S.TOTAL, % IVA, TOTAL)
   * - Black header row with white text
   * - Item rows with proper alignment
   * - Empty spacer row
   * - IVA summary row (label in col 5, amount in col 6)
   * - Total row with light gray label cell and black value cell
   * - Medium blue borders (#3559A6) for all cells
   */
  private buildInvoiceTable(tableData: DataInvoicesTable[]): object {
    // Border color: medium blue
    const borderColor = '#3559A6';
    // Light gray for Total label cell
    const lightGray = '#E5E5E5';

    // Column widths (approximate percentages): 8%, 46%, 9%, 15%, 11%, 15%
    // Using percentage strings for pdfmake
    const columnWidths = ['8%', '*', '9%', '15%', '11%', '15%'];

    // Filter out IVA and TOTAL rows from tableData to get actual line items
    const lineItems = tableData.filter(
      (item) =>
        item.perCentIva !== DataInvoicesConstant.IVA &&
        item.perCentIva !== DataInvoicesConstant.TOTAL
    );

    // Find IVA and TOTAL rows
    const ivaRow = tableData.find((item) => item.perCentIva === DataInvoicesConstant.IVA);
    const totalRow = tableData.find((item) => item.perCentIva === DataInvoicesConstant.TOTAL);

    // Build table body
    const tableBody: object[][] = [];

    // Row 1: Header row - black background, white text, bold, uppercase
    tableBody.push([
      {
        text: 'ID',
        fillColor: '#000000',
        color: '#FFFFFF',
        bold: true,
        fontSize: 11,
        alignment: 'center',
      },
      {
        text: 'DESCRIPCIÓN',
        fillColor: '#000000',
        color: '#FFFFFF',
        bold: true,
        fontSize: 11,
        alignment: 'center',
      },
      {
        text: 'CANT',
        fillColor: '#000000',
        color: '#FFFFFF',
        bold: true,
        fontSize: 11,
        alignment: 'center',
      },
      {
        text: 'S.TOTAL',
        fillColor: '#000000',
        color: '#FFFFFF',
        bold: true,
        fontSize: 11,
        alignment: 'center',
      },
      {
        text: '% IVA',
        fillColor: '#000000',
        color: '#FFFFFF',
        bold: true,
        fontSize: 11,
        alignment: 'center',
      },
      {
        text: 'TOTAL',
        fillColor: '#000000',
        color: '#FFFFFF',
        bold: true,
        fontSize: 11,
        alignment: 'center',
      },
    ]);

    // Row 2+: Item rows
    lineItems.forEach((item, index) => {
      const itemId = typeof item.id === 'number' ? item.id.toString().padStart(2, '0') : item.id;
      const quantity = item.qtt || '1';
      const subtotal = this.formatCurrency(item.sTotal);
      const ivaPercent =
        typeof item.perCentIva === 'object' && 'value' in item.perCentIva
          ? `${item.perCentIva.value}${UM.PER_CENT}`
          : `${item.perCentIva}${UM.PER_CENT}`;
      const total = this.formatCurrency(item.total);

      tableBody.push([
        { text: itemId, alignment: 'center', fontSize: 10 },
        { text: item.description, alignment: 'left', fontSize: 10 },
        { text: quantity.toString(), alignment: 'center', fontSize: 10 },
        { text: subtotal, alignment: 'right', fontSize: 10 },
        { text: ivaPercent, alignment: 'center', fontSize: 10 },
        { text: total, alignment: 'right', fontSize: 10 },
      ]);
    });

    // Empty spacer row - use non-breaking space to maintain same height as other rows
    tableBody.push([
      { text: '\u00A0', fillColor: '#FFFFFF', fontSize: 10 },
      { text: '\u00A0', fillColor: '#FFFFFF', fontSize: 10 },
      { text: '\u00A0', fillColor: '#FFFFFF', fontSize: 10 },
      { text: '\u00A0', fillColor: '#FFFFFF', fontSize: 10 },
      { text: '\u00A0', fillColor: '#FFFFFF', fontSize: 10 },
      { text: '\u00A0', fillColor: '#FFFFFF', fontSize: 10 },
    ]);

    // Empty cell style with no borders for IVA and Total rows
    const noBorderEmptyCell = { text: '', fillColor: '#FFFFFF', border: [false, false, false, false] };

    // IVA row: columns 1-4 empty (no borders), col 5 = "IVA" (bold), col 6 = amount
    const ivaAmount = ivaRow ? this.formatCurrency(ivaRow.total) : '';
    tableBody.push([
      noBorderEmptyCell,
      noBorderEmptyCell,
      noBorderEmptyCell,
      noBorderEmptyCell,
      { text: 'IVA', bold: true, alignment: 'center', fontSize: 10, fillColor: '#FFFFFF' },
      { text: ivaAmount, alignment: 'right', fontSize: 10, fillColor: '#FFFFFF' },
    ]);

    // Total row: columns 1-4 empty (no borders), col 5 = "Total" (bold, light gray bg),
    // col 6 = amount (bold, white text, black bg)
    const totalAmount = totalRow ? this.formatCurrency(totalRow.total) : '';
    tableBody.push([
      noBorderEmptyCell,
      noBorderEmptyCell,
      noBorderEmptyCell,
      noBorderEmptyCell,
      { text: 'Total', bold: true, alignment: 'center', fontSize: 10, fillColor: lightGray },
      {
        text: totalAmount,
        bold: true,
        alignment: 'right',
        fontSize: 10,
        fillColor: '#000000',
        color: '#FFFFFF',
      },
    ]);

    return {
      table: {
        headerRows: 1,
        widths: columnWidths,
        body: tableBody,
      },
      layout: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => borderColor,
        vLineColor: () => borderColor,
        paddingLeft: () => 4,
        paddingRight: () => 4,
        paddingTop: () => 4,
        paddingBottom: () => 4,
      },
      margin: [0, 10, 0, 20],
    };
  }
}
