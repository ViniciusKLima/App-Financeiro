import { Injectable } from '@angular/core';
import { CompromissoService } from './compromisso.service';
import { CalculadoraService } from '../shared/calculadora.service';
import { CategoriaService } from '../carteira/categoria.service';
import { CartaoService } from '../cartoes/cartao.service';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  constructor(
    private compromissoService: CompromissoService,
    private calculadoraService: CalculadoraService,
    private categoriaService: CategoriaService,
    private cartaoService: CartaoService
  ) {}

  // Obter dados do resumo da home
  obterResumoHome() {
    const categorias = this.categoriaService.getCategorias();
    const cartoes = this.cartaoService.getCartoes();

    const compromissos = this.compromissoService.obterCompromissosMesAtual();
    const atrasados = this.compromissoService.obterCompromissosAtrasados();
    const hoje = this.compromissoService.obterCompromissosDiaAtual();
    const proximos = this.compromissoService.obterProximosCompromissos();

    return {
      totais: {
        geral: this.calculadoraService.calcularTotalGeral(categorias, cartoes),
        categorias: this.calculadoraService.calcularTotalCategorias(categorias),
        cartoes: this.calculadoraService.calcularTotalCartoes(cartoes),
        dividas: this.calculadoraService.calcularTotalDividas(
          categorias,
          cartoes
        ),
      },
      contadores: {
        categorias: this.calculadoraService.contarCategorias(categorias),
        cartoes: this.calculadoraService.contarCartoes(cartoes),
        compromissos: compromissos.length,
        atrasados: atrasados.length,
        hoje: hoje.length,
        proximos: proximos.length,
      },
      compromissos: {
        todos: compromissos,
        atrasados: atrasados,
        hoje: hoje,
        proximos: proximos,
      },
    };
  }

  // Obter estatísticas mensais
  obterEstatisticasMensais() {
    const categorias = this.categoriaService.getCategorias();
    const cartoes = this.cartaoService.getCartoes();
    const compromissos = this.compromissoService.obterCompromissosMesAtual();

    const pagos = compromissos.filter((c) => c.foiPago).length;
    const pendentes = compromissos.filter((c) => !c.foiPago).length;
    const atrasados =
      this.compromissoService.obterCompromissosAtrasados().length;

    const percentualPago =
      compromissos.length > 0 ? (pagos / compromissos.length) * 100 : 0;

    return {
      compromissos: {
        total: compromissos.length,
        pagos: pagos,
        pendentes: pendentes,
        atrasados: atrasados,
        percentualPago: percentualPago,
      },
      valores: {
        totalDividas: this.calculadoraService.calcularTotalDividas(
          categorias,
          cartoes
        ),
        totalCategorias:
          this.calculadoraService.calcularTotalCategorias(categorias),
        totalCartoes: this.calculadoraService.calcularTotalCartoes(cartoes),
      },
    };
  }

  // Obter próximos vencimentos (próximos 7 dias)
  obterProximosVencimentos() {
    const compromissos = this.compromissoService.obterCompromissosMesAtual();
    const hoje = new Date();
    const proximosSete = new Date();
    proximosSete.setDate(hoje.getDate() + 7);

    return this.compromissoService
      .filtrarCompromissosPorPeriodo(compromissos, hoje, proximosSete)
      .filter((c) => !c.foiPago);
  }

  // Obter relatório de gastos por categoria
  obterRelatorioGastos() {
    const categorias = this.categoriaService.getCategorias();

    return categorias
      .map((categoria) => ({
        nome: categoria.nome,
        cor: categoria.cor,
        total: this.calculadoraService.calcularTotalCategoria(categoria),
        quantidade:
          this.calculadoraService.calcularQuantidadeDividasCategoria(categoria),
      }))
      .sort((a, b) => b.total - a.total);
  }

  // Verificar se há compromissos urgentes
  verificarCompromissosUrgentes() {
    const atrasados = this.compromissoService.obterCompromissosAtrasados();
    const hoje = this.compromissoService.obterCompromissosDiaAtual();

    return {
      temAtrasados: atrasados.length > 0,
      temHoje: hoje.length > 0,
      totalUrgentes: atrasados.length + hoje.length,
      compromissos: [...atrasados, ...hoje],
    };
  }
}
