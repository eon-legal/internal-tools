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
 * It provides a method to create and open a PDF invoice with dynamic content.
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
            // Columna izquierda (To:)
            {
              stack: [
                new Txt('To:').bold().fontSize(14).margin([0, 0, 0, 10]).end,
                new Txt(
                  `${nameAddressOrPassport[0]}\n${
                    rightInvoice.national ? '' : 'Pasaporte'
                  } ${nameAddressOrPassport[1]}}`
                ).margin([0, 0, 0, 5]).end,
              ],
            },
            // Columna derecha (Cuadro negro)
            {
              text: `INVOICE\nInvoice # ${rightInvoice.numberInvoice}\n${
                rightInvoice.date
                  ? formatDateByParams(rightInvoice.date)
                  : formatDateByParams(rightInvoice.rangeDates)
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
        widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [
          [
            { text: 'ID', style: 'tableHeader' },
            { text: 'DESCRIPCIÓN', style: 'tableHeader' },
            { text: 'QTT', style: 'tableHeader' },
            { text: 'PRICE', style: 'tableHeader' },
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
                  : undefined, // Borde izquierdo en las últimas filas primero true
            },
            {
              text: item.description,
              wordWrap: true,
              style: 'tableCell',
              border:
                index >= tableData.length - 2
                  ? [false, false, false, false]
                  : undefined, // Sin bordes en las últimas filas
            },
            {
              text: item?.qtt || '',
              style: 'tableCell',
              border:
                index >= tableData.length - 2
                  ? [false, false, false, false]
                  : undefined, // Sin bordes en las últimas filas
            },
            {
              text: item?.price || '',
              style: 'tableCell',
              border:
                index >= tableData.length - 2
                  ? [false, false, false, false]
                  : undefined, // Sin bordes en las últimas filas
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
                  : undefined, // Sin bordes en las últimas filas
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
                  : undefined, // Sin bordes en las últimas filas
            },
            {
              text: `${item.total} ${UM.EU}`,
              fillColor: index === tableData.length - 1 ? '#000000' : undefined,
              color: index === tableData.length - 1 ? '#FFFFFF' : undefined,
              border:
                index >= tableData.length - 2
                  ? [true, true, true, true]
                  : undefined, // Bordes derecho e inferior en las últimas filas
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
        text: 'From:',
        style: 'fromHeader',
        margin: [0, 20, 0, 10],
      },
      {
        text: `Name: ${endPage.nameDestination}`,
        style: 'fromItem',
        margin: [0, 0, 0, 5],
      },
      {
        text: `Cuenta: ${endPage.accountDestination}`,
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

    // Crea y abre el PDF
    pdf.create().open();
  }
}
