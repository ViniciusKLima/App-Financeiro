import { Component, OnInit } from '@angular/core';
import { DividaService, Divida } from '../services/dividas.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  abaAtual: 'pendentes' | 'pagos' = 'pendentes';

  dividasAtrasadas: Divida[] = [];
  dividasPagas: Divida[] = [];
  dividasPorDia: { [dia: number]: Divida[] } = {};
  dividasPagasPorDia: { [dia: number]: Divida[] } = {};
  public objectKeys = Object.keys;

  constructor(private dividaService: DividaService) {}

  ngOnInit() {
    this.carregarDividas();
  }

  trocarAba(aba: 'pendentes' | 'pagos') {
    this.abaAtual = aba;
  }

  formatarTituloDia(dia: number): string {
    const hoje = new Date().getDate();
    if (dia === hoje) return 'Hoje';
    if (dia === hoje + 1) return 'Amanhã';
    return `Dia ${dia}`;
  }

  carregarDividas() {
    const hoje = new Date().getDate();
    this.dividasAtrasadas = [];
    this.dividasPagas = [];
    this.dividasPorDia = {};
    this.dividasPagasPorDia = {};

    this.dividaService.getDividas().forEach((divida) => {
      if (!divida.foiPago && divida.dia < hoje) {
        this.dividasAtrasadas.push(divida);
      } else if (divida.foiPago) {
        this.dividasPagas.push(divida);

        if (!this.dividasPagasPorDia[divida.dia]) {
          this.dividasPagasPorDia[divida.dia] = [];
        }
        this.dividasPagasPorDia[divida.dia].push(divida);
      } else {
        if (!this.dividasPorDia[divida.dia]) {
          this.dividasPorDia[divida.dia] = [];
        }
        this.dividasPorDia[divida.dia].push(divida);
      }
    });

    // Ordenar atrasadas e pagas por dia
    this.dividasAtrasadas.sort((a, b) => a.dia - b.dia);
    this.dividasPagas.sort((a, b) => a.dia - b.dia);

    // Ordenar dividasPorDia
    const ordenadoPendentes: { [dia: number]: Divida[] } = {};
    Object.keys(this.dividasPorDia)
      .map((k) => parseInt(k, 10))
      .sort((a, b) => a - b)
      .forEach((dia) => {
        ordenadoPendentes[dia] = this.dividasPorDia[dia];
      });
    this.dividasPorDia = ordenadoPendentes;

    // Ordenar dividasPagasPorDia
    const ordenadoPagas: { [dia: number]: Divida[] } = {};
    Object.keys(this.dividasPagasPorDia)
      .map((k) => parseInt(k, 10))
      .sort((a, b) => a - b)
      .forEach((dia) => {
        ordenadoPagas[dia] = this.dividasPagasPorDia[dia];
      });
    this.dividasPagasPorDia = ordenadoPagas;
  }

  alternarStatus(id: string) {
    this.dividaService.togglePago(id);
    this.carregarDividas();
  }
}
