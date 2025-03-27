// __mocks__/jspdf.ts

class MockJsPDF {
  addedPages = 0;
  images: Array<{
    imgData: string;
    format: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }> = [];
  textContent: Array<{
    text: string;
    x: number;
    y: number;
  }> = [];
  options: any;

  constructor(options?: any) {
    this.options = options || {};
  }

  addImage(
    imgData: string,
    format: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.images.push({ imgData, format, x, y, width, height });
  }

  addPage() {
    this.addedPages++;
  }

  text(text: string, x: number, y: number) {
    this.textContent.push({ text, x, y });
  }

  setFontSize(size: number) {
    return this;
  }

  setTextColor(color: number) {
    return this;
  }

  output(type: string) {
    if (type === 'blob') {
      return new Blob(['mock-pdf-content'], { type: 'application/pdf' });
    }
    return '';
  }

  internal = {
    pageSize: {
      width: 210,
      height: 297,
    },
  };

  getTextDimensions(text: string) {
    return { w: text.length * 2 };
  }
}

const mockJsPDF = jest.fn((options?: any) => {
  return new MockJsPDF(options);
}) as unknown as jest.MockedFunction<any>;

export default mockJsPDF;