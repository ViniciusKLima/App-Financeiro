import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CalculadoraService {
  // Cálculos de categorias
  calcularTotalCategoria(categoria: any): number {
    if (!categoria || !Array.isArray(categoria.dividas)) return 0;

    return categoria.dividas.reduce((total: number, divida: any) => {
      return total + (parseFloat(divida.valor) || 0);
    }, 0);
  }

  calcularQuantidadeDividasCategoria(categoria: any): number {
    if (!categoria || !Array.isArray(categoria.dividas)) return 0;
    return categoria.dividas.length;
  }

  calcularTotalCategorias(categorias: any[]): number {
    if (!Array.isArray(categorias) || categorias.length === 0) return 0;

    return categorias
      .filter((categoria: any) => categoria.somarAoTotal !== false)
      .reduce((total: number, categoria: any) => {
        if (Array.isArray(categoria.dividas)) {
          return (
            total +
            categoria.dividas.reduce(
              (soma: number, divida: any) => soma + (Number(divida.valor) || 0),
              0
            )
          );
        }
        return total;
      }, 0);
  }

  // Cálculos de cartões
  calcularTotalCartao(cartao: any): number {
    if (!cartao || !Array.isArray(cartao.compras)) return 0;

    return cartao.compras.reduce((total: number, compra: any) => {
      return total + (parseFloat(compra.valor) || 0);
    }, 0);
  }

  calcularTotalCartoes(cartoes: any[]): number {
    if (!Array.isArray(cartoes) || cartoes.length === 0) return 0;

    return cartoes
      .filter((cartao: any) => cartao.somarAoTotal !== false)
      .reduce((total: number, cartao: any) => {
        if (Array.isArray(cartao.compras)) {
          return (
            total +
            cartao.compras.reduce(
              (soma: number, compra: any) => soma + (Number(compra.valor) || 0),
              0
            )
          );
        }
        return total;
      }, 0);
  }

  // Cálculos gerais
  calcularTotalGeral(categorias: any[], cartoes: any[]): number {
    return (
      this.calcularTotalCategorias(categorias) +
      this.calcularTotalCartoes(cartoes)
    );
  }

  calcularTotalDividas(categorias: any[], cartoes: any[]): number {
    let total = 0;

    // Soma dívidas das categorias
    if (Array.isArray(categorias) && categorias.length > 0) {
      categorias.forEach((cat: any) => {
        if (
          cat.dividas &&
          Array.isArray(cat.dividas) &&
          cat.dividas.length > 0
        ) {
          cat.dividas.forEach((divida: any) => {
            total += Number(divida.valor) || 0;
          });
        }
      });
    }

    // Soma compras dos cartões
    if (Array.isArray(cartoes) && cartoes.length > 0) {
      cartoes.forEach((cartao: any) => {
        if (
          cartao.compras &&
          Array.isArray(cartao.compras) &&
          cartao.compras.length > 0
        ) {
          cartao.compras.forEach((compra: any) => {
            total += Number(compra.valor) || 0;
          });
        }
      });
    }

    return total;
  }

  // Utilitários de contagem
  contarCategorias(categorias: any[]): number {
    return Array.isArray(categorias) ? categorias.length : 0;
  }

  contarCartoes(cartoes: any[]): number {
    return Array.isArray(cartoes) ? cartoes.length : 0;
  }
}
