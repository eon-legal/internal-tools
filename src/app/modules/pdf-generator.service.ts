import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  constructor() {}

  public generatePDF(content: string, filename: string): void {
    const doc = new jsPDF();
    doc.text(content, 10, 10);
    doc.save(filename);
  }
}
