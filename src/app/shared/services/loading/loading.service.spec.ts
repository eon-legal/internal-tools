import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    service = new LoadingService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loading$ observable', () => {
    it('should emit false as initial value', (done) => {
      service.loading$.subscribe((value) => {
        expect(value).toBe(false);
        done();
      });
    });

    it('should emit true when show() is called', (done) => {
      service.show();

      service.loading$.subscribe((value) => {
        expect(value).toBe(true);
        done();
      });
    });

    it('should emit false when hide() is called after show()', (done) => {
      service.show();
      service.hide();

      service.loading$.subscribe((value) => {
        expect(value).toBe(false);
        done();
      });
    });
  });

  describe('show() method', () => {
    it('should set loading to true', () => {
      service.show();
      expect(service['loadingSubject'].value).toBe(true);
    });
  });

  describe('hide() method', () => {
    it('should set loading to false', () => {
      // Primero mostramos para luego ocultar
      service.show();
      service.hide();
      expect(service['loadingSubject'].value).toBe(false);
    });

    it('should set loading to false even if not shown before', () => {
      service.hide();
      expect(service['loadingSubject'].value).toBe(false);
    });
  });
});
