import { RouterModule } from '@angular/router';
import { ContainComponent } from './contain.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('ContainComponent', () => {
  let component: ContainComponent;
  let fixture: ComponentFixture<ContainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainComponent, RouterModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ContainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept isMenuOpen input', () => {
    component.isMenuOpen = true;
    fixture.detectChanges();
    
    const mainElement = fixture.nativeElement.querySelector('main');
    expect(mainElement.classList.contains('menu-open')).toBe(true);
    
    component.isMenuOpen = false;
    fixture.detectChanges();
    expect(mainElement.classList.contains('menu-open')).toBe(false);
  });

  it('should have router-outlet', () => {
    const routerOutlet = fixture.nativeElement.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();
  });
});