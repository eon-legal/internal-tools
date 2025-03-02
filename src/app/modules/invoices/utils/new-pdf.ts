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

export async function newGeneratePDFInvoices(
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
          { text: 'ID', style: 'tableHeader' }, //#2c3e50
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
  pdf.create().open();
}
