import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { MeusLivros } from './meus-livros';

describe('MeusLivros', () => {
  let component: MeusLivros;
  let fixture: ComponentFixture<MeusLivros>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeusLivros],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(MeusLivros);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
