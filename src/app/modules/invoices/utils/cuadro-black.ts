import { PdfMakeWrapper, Txt, Img, Canvas, Line } from 'pdfmake-wrapper';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { SecondForm } from '../interfaces/second-form';
import { DataInvoicesTable } from '../interfaces/data-invoices-table';
import { UM } from '../constants/um';
import { FisrtForm } from '../interfaces/first-form';
import { formatDateByParams } from './format-date';
import { DataInvoicesConstant } from '../constants/data-invoices';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export function generateTest() {
  const docDefinition = {
    content: [
      {
        canvas: [
          {
            type: 'rect',
            x: 50,
            y: 50,
            w: 150, // Cuadrado más grande
            h: 150,
            color: '#FF0000', // Rojo
          },
        ],
      },
      {
        text: 'Texto en blanco',
        absolutePosition: { x: 80, y: 120 }, // Nueva posición
        color: '#ffffff',
        fontSize: 12,
        bold: true,
      },
      {
        text: 'Más texto aquí',
        absolutePosition: { x: 60, y: 200 },
        color: '#000000',
        fontSize: 14,
      },
    ],
  };
  
  pdfMake.createPdf(docDefinition).download('cuadrado-personalizado.pdf');
}