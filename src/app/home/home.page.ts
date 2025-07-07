import { Component, OnInit } from '@angular/core';
import { FinanceiroService } from '../services/financeiro.service';

interface Compromisso {
  id: string;
  nome: string;
  tipo: 'cartao' | 'divida';
  valor: number;
  dia: number; // dia de vencimento ou pagamento
  cor: string;
  icone: string;
  foiPago?: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  abaAtual: 'pendentes' | 'pagos' = 'pendentes';

  compromissosPorDia: { [dia: number]: Compromisso[] } = {};
  compromissosPagosPorDia: { [dia: number]: Compromisso[] } = {};
  compromissosAtrasados: Compromisso[] = [];
  public objectKeys = Object.keys;

  constructor(private financeiroService: FinanceiroService) {}

  ngOnInit() {
    this.carregarCompromissos();
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

  carregarCompromissos() {
    const hoje = new Date().getDate();
    const compromissos: Compromisso[] = [];

    // Adiciona cartões (cada cartão é um compromisso)
    this.financeiroService.getCartoes().forEach((cartao) => {
      compromissos.push({
        id: 'cartao-' + cartao.id,
        nome: cartao.nome,
        tipo: 'cartao',
        valor: cartao.valor,
        dia: cartao.diaVencimento,
        cor: cartao.cor,
        icone: 'card-outline',
        foiPago: false,
      });
    });

    // Adiciona cada dívida de cada categoria
    this.financeiroService.getCategorias().forEach((cat) => {
      if (cat.dividas && cat.dividas.length > 0) {
        cat.dividas.forEach((divida: any, idx: number) => {
          compromissos.push({
            id: `divida-${cat.id}-${idx}`,
            nome: divida.nome,
            tipo: 'divida',
            valor: divida.valor,
            dia: divida.diaPagamento,
            cor: cat.cor,
            icone: cat.icone,
            foiPago: divida.foiPago ?? false,
          });
        });
      }
    });

    // Separar por status e dia
    this.compromissosPorDia = {};
    this.compromissosPagosPorDia = {};
    this.compromissosAtrasados = [];

    compromissos.forEach((comp) => {
      if (comp.foiPago) {
        if (!this.compromissosPagosPorDia[comp.dia])
          this.compromissosPagosPorDia[comp.dia] = [];
        this.compromissosPagosPorDia[comp.dia].push(comp);
      } else if (comp.dia < hoje) {
        this.compromissosAtrasados.push(comp);
      } else {
        if (!this.compromissosPorDia[comp.dia])
          this.compromissosPorDia[comp.dia] = [];
        this.compromissosPorDia[comp.dia].push(comp);
      }
    });

    // Ordenar arrays por dia
    this.compromissosAtrasados.sort((a, b) => a.dia - b.dia);

    const ordenadoPendentes: { [dia: number]: Compromisso[] } = {};
    Object.keys(this.compromissosPorDia)
      .map((k) => parseInt(k, 10))
      .sort((a, b) => a - b)
      .forEach((dia) => {
        ordenadoPendentes[dia] = this.compromissosPorDia[dia];
      });
    this.compromissosPorDia = ordenadoPendentes;

    const ordenadoPagos: { [dia: number]: Compromisso[] } = {};
    Object.keys(this.compromissosPagosPorDia)
      .map((k) => parseInt(k, 10))
      .sort((a, b) => a - b)
      .forEach((dia) => {
        ordenadoPagos[dia] = this.compromissosPagosPorDia[dia];
      });
    this.compromissosPagosPorDia = ordenadoPagos;
  }

  getValorTotalCartao(cartaoId: string): number {
    return this.financeiroService.getValorTotalCartao(cartaoId);
  }

  alternarStatus(id: string) {
    // Aqui você pode implementar lógica para marcar como pago (exemplo: salvar no localStorage)
    // Exemplo simples: alternar no array local (não persiste)
    Object.values(this.compromissosPorDia).forEach((arr) => {
      arr.forEach((comp) => {
        if (comp.id === id) comp.foiPago = !comp.foiPago;
      });
    });
    Object.values(this.compromissosAtrasados).forEach((comp: any) => {
      if (comp.id === id) comp.foiPago = !comp.foiPago;
    });
    Object.values(this.compromissosPagosPorDia).forEach((arr) => {
      arr.forEach((comp) => {
        if (comp.id === id) comp.foiPago = !comp.foiPago;
      });
    });
    this.carregarCompromissos();
  }
}
