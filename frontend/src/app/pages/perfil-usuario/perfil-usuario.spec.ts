import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { PerfilUsuario } from './perfil-usuario';

describe('PerfilUsuario', () => {
  let component: PerfilUsuario;
  let fixture: ComponentFixture<PerfilUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilUsuario],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilUsuario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
