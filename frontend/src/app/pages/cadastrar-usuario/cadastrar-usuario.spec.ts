import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { CadastrarUsuario } from './cadastrar-usuario';

describe('CadastrarUsuario', () => {
  let component: CadastrarUsuario;
  let fixture: ComponentFixture<CadastrarUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastrarUsuario],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(CadastrarUsuario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
