import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasarListaPage } from './pasar-lista.page';

describe('PasarListaPage', () => {
  let component: PasarListaPage;
  let fixture: ComponentFixture<PasarListaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PasarListaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
