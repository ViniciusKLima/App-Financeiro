import { Injectable } from '@angular/core';
import { FirebaseService } from '../core/firebase.service';
import { StorageService } from '../core/storage.service';
import { CategoriaService } from '../carteira/categoria.service';
import { CartaoService } from '../cartoes/cartao.service';

@Injectable({
  providedIn: 'root',
})
export class CompromissoService {
  constructor(
    private firebaseService: FirebaseService,
    private storageService: StorageService,
    private categoriaService: CategoriaService,
    private cartaoService: CartaoService
  ) {}

  // Obter todos os compromissos (categorias + cartões)
  obterTodosCompromissos(): any[] {
    const compromissos: any[] = [];
    const hoje = new Date();
    const diaAtual = hoje.getDate();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    // Adicionar compromissos das categorias
    const categorias = this.categoriaService.getCategorias();
    categorias.forEach((categoria: any) => {
      if (categoria.dividas && Array.isArray(categoria.dividas)) {
        categoria.dividas.forEach((divida: any) => {
          const compromisso = {
            id: `categoria-${categoria.id}-${divida.id}`,
            nome: divida.nome,
            valor: divida.valor,
            dia: divida.diaPagamento,
            mes: mesAtual,
            ano: anoAtual,
            cor: categoria.cor,
            icone: categoria.icone,
            tipo: 'categoria',
            categoriaId: categoria.id,
            dividaId: divida.id,
            foiPago: this.storageService.obterStatusPagamento(
              `categoria-${categoria.id}-${divida.id}`
            ),
          };
          compromissos.push(compromisso);
        });
      }
    });

    // Adicionar compromissos dos cartões
    const cartoes = this.cartaoService.getCartoes();
    cartoes.forEach((cartao: any) => {
      const compromisso = {
        id: `cartao-${cartao.id}`,
        nome: cartao.nome,
        valor: 0, // Será calculado dinamicamente
        dia: cartao.diaVencimento,
        mes: mesAtual,
        ano: anoAtual,
        cor: cartao.cor,
        icone: 'card-outline',
        tipo: 'cartao',
        cartaoId: cartao.id,
        foiPago: this.storageService.obterStatusPagamento(
          `cartao-${cartao.id}`
        ),
      };
      compromissos.push(compromisso);
    });

    return compromissos;
  }

  // Filtrar compromissos do mês atual
  obterCompromissosMesAtual(): any[] {
    const compromissos = this.obterTodosCompromissos();
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    return compromissos.filter(
      (compromisso) =>
        compromisso.mes === mesAtual && compromisso.ano === anoAtual
    );
  }

  // Filtrar compromissos atrasados
  obterCompromissosAtrasados(): any[] {
    const compromissos = this.obterCompromissosMesAtual();
    const hoje = new Date();
    const diaAtual = hoje.getDate();

    return compromissos.filter(
      (compromisso) => compromisso.dia < diaAtual && !compromisso.foiPago
    );
  }

  // Filtrar compromissos do dia atual
  obterCompromissosDiaAtual(): any[] {
    const compromissos = this.obterCompromissosMesAtual();
    const hoje = new Date();
    const diaAtual = hoje.getDate();

    return compromissos.filter(
      (compromisso) => compromisso.dia === diaAtual && !compromisso.foiPago
    );
  }

  // Filtrar próximos compromissos
  obterProximosCompromissos(): any[] {
    const compromissos = this.obterCompromissosMesAtual();
    const hoje = new Date();
    const diaAtual = hoje.getDate();

    return compromissos.filter(
      (compromisso) => compromisso.dia > diaAtual && !compromisso.foiPago
    );
  }

  // Alterar status de pagamento
  async alternarStatusPagamento(
    compromissoId: string,
    pago: boolean,
    uid?: string
  ) {
    // Salva no localStorage
    this.storageService.salvarStatusPagamento(
      compromissoId,
      pago,
      pago ? new Date().toISOString().slice(0, 10) : undefined
    );

    // Salva no Firebase
    if (uid) {
      await this.firebaseService.salvarStatusPagamento(
        uid,
        compromissoId,
        pago
      );
    }
  }

  // Carregar status de pagamentos do Firebase
  async carregarStatusPagamentos(uid: string) {
    const pagamentos = await this.firebaseService.carregarStatusPagamentos(uid);
    this.storageService.sincronizarPagamentos(pagamentos);
  }

  // Ordenar compromissos por dia
  ordenarCompromissosPorDia(compromissos: any[]): any[] {
    return compromissos.sort((a, b) => a.dia - b.dia);
  }

  // Filtrar compromissos por período
  filtrarCompromissosPorPeriodo(
    compromissos: any[],
    dataInicio: Date,
    dataFim: Date
  ): any[] {
    return compromissos.filter((compromisso) => {
      const dataCompromisso = new Date(
        compromisso.ano,
        compromisso.mes - 1,
        compromisso.dia
      );
      return dataCompromisso >= dataInicio && dataCompromisso <= dataFim;
    });
  }
}
