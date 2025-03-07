import { TestBed } from '@angular/core/testing';

import { DownloadImagePdfService } from './download-image-pdf.service';

describe('DownloadImagePdfService', () => {
  let service: DownloadImagePdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DownloadImagePdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
