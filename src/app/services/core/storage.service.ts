import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly LOCAL_KEY = 'dadosFinanceiros';

  // Salva dados completos no localStorage
  salvarDados(dados: any) {
    localStorage.setItem(this.LOCAL_KEY, JSON.stringify(dados));
  }

  // Carrega dados completos do localStorage
  carregarDados() {
    const dados = localStorage.getItem(this.LOCAL_KEY);
    if (dados) {
      const obj = JSON.parse(dados);
      return {
        cartoes: obj.cartoes || [],
        categorias: obj.categorias || [],
      };
    }
    return { cartoes: [], categorias: [] };
  }

  // Salva status de pagamento
  salvarStatusPagamento(compromissoId: string, pago: boolean, data?: string) {
    localStorage.setItem(`pago-${compromissoId}`, pago.toString());
    if (pago && data) {
      localStorage.setItem(`dataPagamento-${compromissoId}`, data);
    } else {
      localStorage.removeItem(`dataPagamento-${compromissoId}`);
    }
  }

  // Obtém status de pagamento
  obterStatusPagamento(compromissoId: string): boolean {
    return localStorage.getItem(`pago-${compromissoId}`) === 'true';
  }

  // Sincroniza pagamentos do Firebase
  sincronizarPagamentos(pagamentos: any) {
    Object.keys(pagamentos).forEach((compromissoId) => {
      const status = pagamentos[compromissoId];
      if (status.pago) {
        this.salvarStatusPagamento(compromissoId, true, status.dataPagamento);
      } else {
        this.salvarStatusPagamento(compromissoId, false);
      }
    });
  }
}
