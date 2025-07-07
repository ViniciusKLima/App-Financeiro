import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DividasPage } from './dividas.page';

describe('DividasPage', () => {
  let component: DividasPage;
  let fixture: ComponentFixture<DividasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DividasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
