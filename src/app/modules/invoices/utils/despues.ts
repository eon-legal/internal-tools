import { PdfMakeWrapper, Txt, Img } from 'pdfmake-wrapper';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { SecondForm } from '../interfaces/second-form';
import { DataInvoicesTable } from '../interfaces/data-invoices-table';
import { UM } from '../constants/um';
import { FisrtForm } from '../interfaces/first-form';
import { formatDateByParams } from './format-date';
import { DataInvoicesConstant } from '../constants/data-invoices';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Función principal para generar el PDF
export async function newGeneratePDFInvoicesAfter(
  nameAddressOrPassport: [string, string],
  endPage: SecondForm,
  rightInvoice: FisrtForm,
  tableData: DataInvoicesTable[]
) {
  const pdf = new PdfMakeWrapper();

  // Configuración de página
  pdf.pageMargins([40, 60, 40, 60]); // Reducir margen superior para subir el contenido
  pdf.defaultStyle({
    fontSize: 10,
  });

  // Logo centrado (subido hacia arriba)
  pdf.add(
    await new Img('assets/logo.png')
      .fit([200, 100])
      .alignment('center')
      .margin([0, 0, 0, 10]) // Reducir margen inferior del logo
      .build()
  );

  // Texto que irá dentro del cuadro negro
  const invoiceText = `INVOICE\nInvoice # ${rightInvoice.numberInvoice}\n${
    rightInvoice.date
      ? formatDateByParams(rightInvoice.date)
      : formatDateByParams(rightInvoice.rangeDates)
  }`;

  // Calcular el tamaño del texto
  const fontSize = 12; // Tamaño de la fuente
  const lineHeight = 1.2; // Altura de línea
  const padding = 10; // Margen interno del cuadro
  const maxWidth = 250; // Ancho máximo del cuadro

  // Dividir el texto en líneas
  const lines = splitTextIntoLines(invoiceText, maxWidth, fontSize);

  // Calcular la altura del cuadro en función del número de líneas
  const textHeight = lines.length * fontSize * lineHeight;
  const boxHeight = textHeight + padding * 2; // Altura del cuadro

  // Sección superior en columnas
  pdf.add({
    columns: [
      // Columna izquierda (To:)
      {
        width: '*',
        stack: [
          new Txt('To:').bold().fontSize(14).margin([0, 0, 0, 10]).end,
          ...nameAddressOrPassport.map(
            (text, index) =>
              new Txt(
                index === 0
                  ? text
                  : rightInvoice.national
                  ? text
                  : `Pasaporte: ${text}`
              ).margin([0, 0, 0, 5]).end
          ),
        ],
      },
      // Columna derecha (Recuadro negro con texto)
      {
        width: maxWidth,
        stack: [
          // Cuadro negro
          {
            canvas: [
              {
                type: 'rect',
                x: 0,
                y: 0,
                w: maxWidth, // Ancho del cuadro
                h: boxHeight, // Alto del cuadro (calculado)
                color: '#000000', // Color negro
              },
            ],
          },
          // Texto dentro del cuadro negro (ahora visible)
          {
            text: invoiceText,
            absolutePosition: { x: padding, y: padding }, // Posición del texto
            color: '#ffffff', // Texto en blanco
            fontSize: fontSize,
            lineHeight: lineHeight,
          },
        ],
      },
    ],
    columnGap: 20,
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
          { text: item.id, style: 'tableCell' },
          { text: item.description, wordWrap: true, style: 'tableCell' },
          { text: item?.qtt || '', style: 'tableCell' },
          { text: item?.price || '', style: 'tableCell' },
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
          },
          {
            text: `${item.perCentIva} ${
              item.perCentIva === DataInvoicesConstant.IVA ||
              item.perCentIva === DataInvoicesConstant.TOTAL
                ? ''
                : UM.PER_CENT
            }`,
            style: 'tableCell',
          },
          {
            text: `${item.total} ${UM.EU}`,
            color: index === tableData.length - 1 ? '#FFFFFF' : undefined, // Última celda en negro
            fillColor: index === tableData.length - 1 ? '#000000' : undefined, // Última celda en negro
          },
        ]),
      ],
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 0.8,
      hLineColor: '#0066CC',
      vLineColor: '#0066CC',
    },
    margin: [0, 10, 0, 20],
  });

  // Sección "From"
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

  // Estilos
  pdf.styles({
    fromHeader: {
      bold: true,
      fontSize: 14,
    },
    fromItem: {
      fontSize: 10,
      lineHeight: 1.1,
    },
    tableHeader: {
      bold: true,
      fontSize: 10,
    },
    tableCell: {
      fontSize: 10,
    },
    /*lastCell: {
      fontSize: 10,
      fillColor: '#000000', // Última celda en negro
      color: '#FFFFFF', // Texto en blanco
    },*/
  });

  // Generar y abrir el PDF
  pdf.create().open();
}

// Función para dividir el texto en líneas
function splitTextIntoLines(text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = calculateTextWidth(testLine, fontSize);

    if (testWidth > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

// Función para calcular el ancho del texto (aproximado)
function calculateTextWidth(text: string, fontSize: number): number {
  return text.length * 0.6 * fontSize;
}