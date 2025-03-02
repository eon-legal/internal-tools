import { PdfMakeWrapper, Txt, Img } from 'pdfmake-wrapper';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { SecondForm } from '../interfaces/second-form';
import { DataInvoicesTable } from '../interfaces/data-invoices-table';
import { UM } from '../constants/um';
import { FisrtForm } from '../interfaces/first-form';
import { DataInvoicesConstant } from '../constants/data-invoices';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Función para formatear fechas
function formatDateByParams(date: Date | [Date, Date]): string {
  if (Array.isArray(date)) {
    const [date1, date2] = date;
    return `${new Date(date1).toLocaleDateString()} - ${new Date(
      date2
    ).toLocaleDateString()}`;
  }
  return new Date(date).toLocaleDateString();
}

// Función principal para generar el PDF
export async function hardCodeadoPDF() {
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

  // Datos hardcodeados
  const nameAddressOrPassport: [string, string] = [
    'Bilge Adam Yazılım ve Teknoloji A.Ş',
    'Reşitpaşa Mah. Katar Cad. İtü Arı Teknokent 3 Binası Blok No:4/ B303 Sarıyer/ İstanbul Sarıyer Vergi Dairesi NO: 171 022 9699',
  ];
  const endPage: SecondForm = {
    nameDestination: 'Jane Doe',
    accountDestination: '123456789',
    addressDestination: '456 Elm St',
    nameBank: 'Bank Name',
    addressBank: '789 Oak St',
    nif: '12345678A',
  };
  const rightInvoice: FisrtForm = {
    numberInvoice: '12345',
    date: new Date(2023, 10, 1),
    rangeDates: [new Date(2023, 10, 1), new Date(2023, 10, 4)],
    national: true,
    address: 'Cubita',
    dateOrDateRange: false,
    name: 'La UCI',
    passport: 'Soy yo',
  };
  const tableData: DataInvoicesTable[] = [
    {
      id: '1',
      description: 'Product 1',
      qtt: '2',
      price: '50',
      sTotal: '100',
      perCentIva: '21',
      total: '121',
    },
  ];

  // Texto del cuadro negro
  const invoiceText = `INVOICE\nInvoice #  EON-25-BA02\n2023-10-01`;

  // Configuración del recuadro
  const fontSize = 12;
  const padding = 15;
  const maxWidth = 250;

  // Calcular altura del texto
  const lines = invoiceText.split('\n').length;
  const lineHeight = 1.2;
  const boxHeight = lines * fontSize * lineHeight + padding * 2;

  // Sección superior en columnas
  // Sección de columnas
  /*pdf.add({
    columns: [
      // Columna izquierda (To:)
      {
        width: '*',
        stack: [
          new Txt('To:').bold().fontSize(14).margin([0, 0, 0, 10]).end,
          new Txt('John Doe').margin([0, 0, 0, 5]).end,
          new Txt('123 Main St').margin([0, 0, 0, 5]).end,
        ],
      },
      // Columna derecha (Recuadro negro)
      {
        width: maxWidth,
        stack: [
          {
            canvas: [
              {
                type: 'rect',
                x: 0,
                y: 0,
                w: maxWidth,
                h: boxHeight,
                color: '#000000', // Color del recuadro
              },
            ],
          },
          {
            text: invoiceText,
            absolutePosition: { x: 250 + padding, y: 163 + padding }, // Posición exacta
            color: 'white',
            fontSize: fontSize,
            lineHeight: lineHeight,
            alignment: 'center', // Texto centrado
          },
        ],
      },
    ],
    columnGap: 20,
  });*/

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
              new Txt('John Doe\n123 Main St\nNew York, NY').margin([
                0, 0, 0, 5,
              ]).end,
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
      hLineWidth: () => 0, // Eliminar líneas de la tabla
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
            fillColor: index === tableData.length - 1 ? '#000000' : undefined, // Última celda en negro
            color: index === tableData.length - 1 ? '#FFFFFF' : undefined, // Texto blanco para la última celda
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
  });

  // Generar y abrir el PDF
  pdf.create().open();
}

// Función para dividir el texto en líneas
function splitTextIntoLines(
  text: string,
  maxWidth: number,
  fontSize: number
): string[] {
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
