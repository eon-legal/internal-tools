import { PdfMakeWrapper, Txt, Img, Columns, Table } from 'pdfmake-wrapper';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Configuración inicial
const dynamicContent = [
  'Nombre del Cliente: John Doe Corporation International Holdings Limited',
  'Dirección: 1234 Main Street, Suite 567, Downtown Business District',
  'Ciudad: Metrópolis Central',
  'País: United States of America Continental Region',
];

const fromData = {
  nombre:
    'Maria Elena de las Mercedes González-Ruiz y Sánchez-Camacho Fernández',
  cuenta:
    'Cuenta Nº 1234-5678-9012-3456-7890-1234-5678 (Cuenta Internacional de Largo Alcance)',
  direccion:
    'Avenida Principal Nº 4567, Edificio Torre Ejecutiva, Piso 25, Departamento 2501, Zona Comercial Norte, Distrito Financiero Globalizado',
  trabajo:
    'Directora Ejecutiva Senior de Operaciones Internacionales y Desarrollo Estratégico Empresarial',
  nombreTrabajo:
    'Corporación Global de Soluciones Integradas Multidisciplinarias e Innovadoras S.A. de C.V.',
  CI: '1234567890-ABCDE-9876543210-UVWXYZ-ABCDEFGHIJ-12345',
};

const address =
  '1234 Business Rd.\nFloor 45\nFinancial District\nMetrópolis, MP 56789';

// Función para generar datos de la tabla
const generateTableData = (count) => {
  const data = [];
  for (let i = 1; i <= count; i++) {
    data.push({
      id: i,
      description: `Producto ${i} - Descripción técnica detallada del ítem ${i}`,
      qtt: Math.floor(Math.random() * 10) + 1,
      price: (Math.random() * 1000).toFixed(2),
      iva: '16%',
    });
  }
  return data;
};

const tableData = generateTableData(210);

const calculateSubtotal = (item) => (item.qtt * item.price).toFixed(2);
const calculateTotal = (subtotal) => (subtotal * 1.16).toFixed(2);

export async function generatePDFInvoices() {
  const pdf = new PdfMakeWrapper();

  // Configuración de página
  pdf.pageMargins([40, 120, 40, 60]);
  pdf.defaultStyle({
    fontSize: 10,
  });

  // Logo centrado
  pdf.add(
    await new Img('assets/logo.png')
      .fit([200, 100])
      .alignment('center')
      .margin([0, 0, 0, 30])
      .build()
  );

  // Sección superior en columnas
  pdf.add({
    columns: [
      {
        width: '*',
        stack: [
          new Txt('To:').bold().fontSize(14).margin([0, 0, 0, 10]).end,
          ...dynamicContent.map(
            (text) => new Txt(text).margin([0, 0, 0, 5]).end
          ),
          new Txt(address).margin([0, 20, 0, 0]).end,
        ],
      },
      {
        width: 250,
        stack: [
          new Txt('INVOICE').fontSize(24).bold().margin([0, 0, 0, 10]).end,
          new Txt('Invoice # 1545-dd-67y').fontSize(14).margin([0, 0, 0, 5])
            .end,
          new Txt('01/01/2025 - 31/01/2025').fontSize(14).end,
        ],
        background: 'black',
        color: 'white',
        margin: [0, 0, 0, 20],
        padding: 15,
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
          { text: 'ID', style: 'tableHeader' },//#2c3e50
          { text: 'DESCRIPCIÓN', style: 'tableHeader' },
          { text: 'QTT', style: 'tableHeader' },
          { text: 'PRICE', style: 'tableHeader' },
          { text: 'SUBTOTAL', style: 'tableHeader' },
          { text: '% IVA', style: 'tableHeader' },
          { text: 'TOTAL', style: 'tableHeader' },
        ].map( header => ({
          ...header, fillColor: '#000000', color: '#FFFFFF'
        })),
        ...tableData.map((item) => [
          { text: item.id.toString(), style: 'tableCell' },
          { text: item.description, wordWrap: true, style: 'tableCell' },
          { text: item.qtt.toString(), style: 'tableCell' },
          { text: `$${item.price}`, style: 'tableCell' },
          { text: `$${calculateSubtotal(item)}`, style: 'tableCell' },
          { text: item.iva, style: 'tableCell' },
          {
            text: `$${calculateTotal(item.qtt * item.price)}`,
            style: 'tableCell',
          },
        ]),
      ],
    },
    layout: {
      //defaultBorder: false,
      hLineWidth: () => 1,
      vLineWidth: () => 0.8,
      hLineColor: '#0066CC', //#3498db
      vLineColor: '#0066CC',
      //fillColor: (rowIndex) => rowIndex === 0 ? '#000000' : 'transparent'
      //paddingTop: 4,
      //paddingBottom: 4,
    },
    margin: [0, 10, 0, 20],
  });

  /*pdf.styles({
    tableHeader: {
      bold: true,
      color: 'green', //#ecf0f1
      margin: [3, 5, 3, 5],
    },
    tableCell: {
      color: 'yellow', //#2c3e50
      margin: [3, 4, 3, 4],
    },
  });*/

  // Sección From: con manejo de saltos
  /* pdf.add({
    stack: [
      new Txt('From:')
        .bold()
        .fontSize(14)
        .margin([0, 20, 0, 10])
        .pageBreak('before').end,
      { text: fromData.nombre, wordWrap: true },
      { text: `Cuenta: ${fromData.cuenta}`, margin: [0, 5], wordWrap: true },
      {
        text: `Dirección: ${fromData.direccion}`,
        margin: [0, 5],
        wordWrap: true,
      },
      { text: `Trabajo: ${fromData.trabajo}`, margin: [0, 5], wordWrap: true },
      {
        text: `Nombre Trabajo: ${fromData.nombreTrabajo}`,
        margin: [0, 5],
        wordWrap: true,
      },
      { text: `CI: ${fromData.CI}`, margin: [0, 5], wordWrap: true },
    ],
    id: 'fromSection',
  });*/
  const fromElements = [
    {
      text: 'From:',
      style: 'fromHeader',
      margin: [0, 20, 0, 10],
    },
    {
      text: fromData.nombre,
      style: 'fromItem',
      margin: [0, 0, 0, 5],
    },
    {
      text: `Cuenta: ${fromData.cuenta}`,
      style: 'fromItem',
      margin: [0, 0, 0, 5],
      wordWrap: true,
    },
    {
      text: `Dirección: ${fromData.direccion}`,
      style: 'fromItem',
      margin: [0, 0, 0, 5],
      wordWrap: true,
    },
    {
      text: `Trabajo: ${fromData.trabajo}`,
      style: 'fromItem',
      margin: [0, 0, 0, 5],
      wordWrap: true,
    },
    {
      text: `Nombre Trabajo: ${fromData.nombreTrabajo}`,
      style: 'fromItem',
      margin: [0, 0, 0, 5],
      wordWrap: true,
    },
    {
      text: `CI: ${fromData.CI}`,
      style: 'fromItem',
      margin: [0, 0, 0, 10],
      wordWrap: true,
    },
  ];

  pdf.add({
    stack: fromElements,
    unbreakable: false, // Permite saltos naturales
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
      lineHeight: 1.1, // Reduce espacio entre líneas
    },
  });
  pdf.create().open();
}
