import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartoesPage } from './cartoes.page';

describe('CartoesPage', () => {
  let component: CartoesPage;
  let fixture: ComponentFixture<CartoesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CartoesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
