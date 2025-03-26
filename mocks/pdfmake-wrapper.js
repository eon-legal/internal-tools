// Mock completo de pdfmake-wrapper en CommonJS
const PdfMakeWrapper = {
  create: jest.fn().mockReturnThis(),
  pageMargins: jest.fn().mockReturnThis(),
  defaultStyle: jest.fn().mockReturnThis(),
  add: jest.fn().mockReturnThis(),
  styles: jest.fn().mockReturnThis(),
  end: jest.fn()
};

const Txt = jest.fn(() => ({
  bold: jest.fn().mockReturnThis(),
  fontSize: jest.fn().mockReturnThis(),
  margin: jest.fn().mockReturnThis(),
  end: {}
}));

const Img = jest.fn(() => ({
  fit: jest.fn().mockReturnThis(),
  alignment: jest.fn().mockReturnThis(),
  margin: jest.fn().mockReturnThis(),
  build: jest.fn().mockResolvedValue({})
}));

module.exports = {
  PdfMakeWrapper,
  Txt,
  Img,
  default: PdfMakeWrapper
};