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
  dataPagamento?: string | null;
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

  constructor(public financeiroService: FinanceiroService) {}

  ngOnInit() {
    this.carregarCompromissos();
  }

  getValorTotalPago(): number {
    let total = 0;
    Object.values(this.compromissosPagosPorDia).forEach((lista) => {
      lista.forEach((comp) => {
        total += Number(comp.valor) || 0;
      });
    });
    return total;
  }

  getValorTotalPendente(): number {
    let total = 0;
    // Pendentes
    Object.values(this.compromissosPorDia).forEach((lista) => {
      lista.forEach((comp) => {
        total += Number(comp.valor) || 0;
      });
    });
    // Atrasados
    this.compromissosAtrasados.forEach((comp) => {
      total += Number(comp.valor) || 0;
    });
    return total;
  }

  async doRefresh(event: any) {
    await this.carregarCompromissosAsync(); // Aguarda o carregamento dos dados
    // Aguarda um pouco ANTES de fechar o refresher, para evitar o efeito do texto atrás
    setTimeout(() => {
      event.target.complete();
    }, 1200); // Tente 1200ms ou até 1500ms para suavizar a experiência
  }

  // Exemplo de função async (ajuste conforme sua lógica)
  async carregarCompromissosAsync() {
    //await this.financeiroService.buscarDadosRemotos(); // sua chamada de API
    this.carregarCompromissos(); // atualiza os dados locais
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
    const hojeISO = new Date().toISOString().slice(0, 10);
    const compromissos: Compromisso[] = [];

    // Adiciona cartões (cada cartão é um compromisso)
    this.financeiroService.getCartoes().forEach((cartao) => {
      const id = 'cartao-' + cartao.id;
      compromissos.push({
        id,
        nome: cartao.nome,
        tipo: 'cartao',
        valor: cartao.valor,
        dia: cartao.diaVencimento,
        cor: cartao.cor,
        icone: 'card-outline',
        foiPago: this.getStatusPago(id),
        dataPagamento: this.getDataPagamento(id),
      });
    });

    // Adiciona cada dívida de cada categoria
    this.financeiroService.getCategorias().forEach((cat) => {
      if (cat.dividas && cat.dividas.length > 0) {
        cat.dividas.forEach((divida: any, idx: number) => {
          const id = `divida-${cat.id}-${idx}`;
          compromissos.push({
            id,
            nome: divida.nome,
            tipo: 'divida',
            valor: divida.valor,
            dia: divida.diaPagamento,
            cor: cat.cor,
            icone: cat.icone,
            foiPago: this.getStatusPago(id),
            dataPagamento: this.getDataPagamento(id),
          });
        });
      }
    });

    // Separar por status e dia
    this.compromissosPorDia = {};
    this.compromissosPagosPorDia = {};
    this.compromissosAtrasados = [];

    compromissos.forEach((comp) => {
      // Se está pago e foi pago em dia anterior ao hoje, vai para pagos
      if (comp.foiPago && comp.dataPagamento && comp.dataPagamento < hojeISO) {
        if (!this.compromissosPagosPorDia[comp.dia])
          this.compromissosPagosPorDia[comp.dia] = [];
        this.compromissosPagosPorDia[comp.dia].push(comp);
      }
      // Se não está pago e está atrasado
      else if (!comp.foiPago && comp.dia < hoje) {
        this.compromissosAtrasados.push(comp);
      }
      // Se não está pago e não está atrasado
      else if (!comp.foiPago) {
        if (!this.compromissosPorDia[comp.dia])
          this.compromissosPorDia[comp.dia] = [];
        this.compromissosPorDia[comp.dia].push(comp);
      }
      // Se está pago mas foi pago hoje, permanece na aba pendentes/atrasados até o dia seguinte
      else if (comp.foiPago && comp.dataPagamento === hojeISO) {
        if (comp.dia < hoje) {
          this.compromissosAtrasados.push(comp);
        } else {
          if (!this.compromissosPorDia[comp.dia])
            this.compromissosPorDia[comp.dia] = [];
          this.compromissosPorDia[comp.dia].push(comp);
        }
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

  getStatusPago(id: string): boolean {
    return localStorage.getItem('pago-' + id) === 'true';
  }

  getDataPagamento(id: string): string | null {
    return localStorage.getItem('dataPagamento-' + id) || null;
  }

  alternarStatus(id: string) {
    const atual = this.getStatusPago(id);
    if (!atual) {
      localStorage.setItem('pago-' + id, 'true');
      localStorage.setItem(
        'dataPagamento-' + id,
        new Date().toISOString().slice(0, 10)
      );
    } else {
      localStorage.setItem('pago-' + id, 'false');
      localStorage.removeItem('dataPagamento-' + id);
    }
    this.carregarCompromissos();
  }
}
