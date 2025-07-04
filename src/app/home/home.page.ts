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
  dividasPorDia: { [dia: number]: Divida[] } = {};
  dividasPagas: Divida[] = [];
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

    this.dividaService.getDividas().forEach((divida) => {
      if (!divida.foiPago && divida.dia < hoje) {
        this.dividasAtrasadas.push(divida);
      } else if (divida.foiPago && divida.dia < hoje) {
        this.dividasPagas.push(divida);
      } else {
        if (!this.dividasPorDia[divida.dia])
          this.dividasPorDia[divida.dia] = [];
        this.dividasPorDia[divida.dia].push(divida);
      }
    });

    this.dividasAtrasadas.sort((a, b) => a.dia - b.dia);
    this.dividasPagas.sort((a, b) => a.dia - b.dia);

    const ordenado: { [dia: number]: Divida[] } = {};
    Object.keys(this.dividasPorDia)
      .map((k) => parseInt(k, 10))
      .sort((a, b) => a - b)
      .forEach((dia) => {
        ordenado[dia] = this.dividasPorDia[dia];
      });
    this.dividasPorDia = ordenado;
  }

  alternarStatus(id: string) {
    this.dividaService.togglePago(id);
    this.carregarDividas();
  }
}
