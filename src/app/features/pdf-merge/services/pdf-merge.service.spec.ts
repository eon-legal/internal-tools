import { TestBed } from '@angular/core/testing';

import { PdfMergeService } from './pdf-merge.service';

describe('PdfMergeService', () => {
  let service: PdfMergeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfMergeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
