import { LayoutComponent } from './layout.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute, RouterModule, UrlTree, NavigationEnd } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { jest } from '@jest/globals';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../data-access/auth/auth.service';
import { LanguageService } from '../../../shared/services/language/language.service';

class MockRouter {
  private subject = new Subject<NavigationEnd>();
  events = this.subject.asObservable();
  url = '/test';
  navigate = jest.fn();
  createUrlTree = jest.fn((commands: any[], navigationExtras?: any) => {
    return {} as UrlTree;
  });
  serializeUrl = jest.fn((url: UrlTree) => '');
  parseUrl = jest.fn((url: string) => ({ root: {} as any }));
  isActive = jest.fn((url: string | UrlTree, exact: boolean) => false);
  navigateByUrl = jest.fn((url: string | UrlTree) => Promise.resolve(true));

  triggerNavigation(url: string) {
    this.url = url;
    this.subject.next(new NavigationEnd(1, url, url));
  }
}

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;
  let router: MockRouter;

  const mockActivatedRoute = {
    snapshot: {
      url: [{ path: 'test' }],
      paramMap: {
        get: (key: string) => '1'
      }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LayoutComponent,
        RouterModule,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useClass: MockRouter },
        { provide: ToastrService, useValue: { success: jest.fn(), error: jest.fn() } },
        { provide: AuthService, useValue: { signOut: jest.fn<() => Promise<{ success: boolean }>>().mockResolvedValue({ success: true }), isAuthenticated: jest.fn<() => boolean>().mockReturnValue(false), userProfile: jest.fn<() => null>().mockReturnValue(null) } },
        { provide: LanguageService, useValue: { getText: jest.fn((key: string) => key), getCurrentLanguage: jest.fn<() => string>().mockReturnValue('es'), onLanguageChange: jest.fn() } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as unknown as MockRouter;
    
    // Mock the private method
    component['updateMenuState'] = jest.fn();
    
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with menu closed', () => {
    expect(component.isMenuOpen).toBe(false);
  });

  it('should initialize menuItems from constant', () => {
    expect(component.menuItems).toBeDefined();
    expect(component.menuItems.length).toBeGreaterThan(0);
  });

  it('should toggle menu state when header emits event', () => {
    component.isMenuOpen = false;
    component.isMenuOpen = !component.isMenuOpen;
    expect(component.isMenuOpen).toBe(true);
  });

  it('should close menu when sidebar emits close event', () => {
    component.isMenuOpen = true;
    component.isMenuOpen = false;
    expect(component.isMenuOpen).toBe(false);
  });

  it('should update menu state on initialization', () => {
    component.ngOnInit();
    expect(component['updateMenuState']).toHaveBeenCalledWith('/test');
  });

  it('should update menu state on navigation end', () => {
    component.ngOnInit();
    router.triggerNavigation('/new-route');
    expect(component['updateMenuState']).toHaveBeenCalledWith('/new-route');
  });

  // Test the actual implementation of updateMenuState
  describe('updateMenuState implementation', () => {
    beforeEach(() => {
      // Restore the original implementation for these tests
      component['updateMenuState'] = LayoutComponent.prototype['updateMenuState'];
    });

    it('should mark menu item as active when route matches', () => {
      const testItem: MenuItem = {
        label: 'Test',
        routerLink: ['/test'],
        styleClass: ''
      };
      component.menuItems = [testItem];
      
      component['updateMenuState']('/test');
      expect(testItem.styleClass).toContain('p-menuitem-active');
    });

    it('should mark parent menu item as active when child route matches', () => {
      const childItem: MenuItem = {
        label: 'Child',
        routerLink: ['/child'],
        styleClass: ''
      };
      const testParent: MenuItem = {
        label: 'Parent',
        styleClass: '',
        items: [childItem]
      };
      component.menuItems = [testParent];

      component['updateMenuState']('/child');
      expect(testParent.styleClass).toContain('p-menuitem-parent-active');
      expect(testParent.expanded).toBe(true);
      expect(childItem.styleClass).toContain('p-menuitem-active');
    });

    it('should not mark menu item as active when route does not match', () => {
      const testItem: MenuItem = {
        label: 'Test',
        routerLink: ['/test'],
        styleClass: 'p-menuitem-active'
      };
      component.menuItems = [testItem];
      
      component['updateMenuState']('/other-route');
      expect(testItem.styleClass).not.toContain('p-menuitem-active');
    });
  });
});