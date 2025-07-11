import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FinanceiroService {
  // Cartões com detalhes e compras
  private cartoes: any[] = [];

  // Grupos de dívidas, cada um com suas dívidas
  private categorias: any[] = [];

  private LOCAL_KEY = 'dadosFinanceiros';

  private salvarLocal() {
    const dados = {
      cartoes: this.cartoes,
      categorias: this.categorias,
    };
    localStorage.setItem(this.LOCAL_KEY, JSON.stringify(dados));
  }

  private carregarLocal() {
    const dados = localStorage.getItem(this.LOCAL_KEY);
    if (dados) {
      const obj = JSON.parse(dados);
      this.cartoes = obj.cartoes || [];
      this.categorias = obj.categorias || [];
    }
  }

  getValorTotalDividas(): number {
    let total = 0;
    // Soma todas as dívidas de todas as categorias
    if (Array.isArray(this.categorias) && this.categorias.length > 0) {
      this.categorias.forEach((cat: any) => {
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
    // Soma todas as compras de todos os cartões
    if (Array.isArray(this.cartoes) && this.cartoes.length > 0) {
      this.cartoes.forEach((cartao: any) => {
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

  getCartoes() {
    return Array.isArray(this.cartoes) ? this.cartoes : [];
  }

  getCartaoById(id: string) {
    return Array.isArray(this.cartoes) && this.cartoes.length > 0
      ? this.cartoes.find((cartao) => cartao.id === id)
      : undefined;
  }

  addCartao(cartao: any) {
    if (!Array.isArray(this.cartoes)) return;
    cartao.id = (Math.random() * 100000).toFixed(0);
    cartao.compras = [];
    this.cartoes.push({ ...cartao });
  }

  addCategoria(categoria: any) {
    if (!Array.isArray(this.categorias)) return;
    categoria.id = (Math.random() * 100000).toFixed(0);
    this.categorias.push({ ...categoria, dividas: [] });
  }

  updateCategoria(categoriaEditada: any) {
    if (!Array.isArray(this.categorias) || this.categorias.length === 0) return;
    const idx = this.categorias.findIndex(
      (cat) => cat.id === categoriaEditada.id
    );
    if (idx !== -1) {
      this.categorias[idx] = { ...this.categorias[idx], ...categoriaEditada };
    }
  }

  updateCartao(cartaoEditado: any) {
    if (!Array.isArray(this.cartoes) || this.cartoes.length === 0) return;
    const idx = this.cartoes.findIndex(
      (cartao) => cartao.id === cartaoEditado.id
    );
    if (idx !== -1) {
      this.cartoes[idx] = { ...this.cartoes[idx], ...cartaoEditado };
    }
  }

  getCategorias() {
    return Array.isArray(this.categorias) ? this.categorias : [];
  }

  getCategoriaById(id: string) {
    return Array.isArray(this.categorias) && this.categorias.length > 0
      ? this.categorias.find((cat) => cat.id === id)
      : undefined;
  }

  getValorTotalCartao(cartaoId: string): number {
    const cartao = Array.isArray(this.cartoes)
      ? this.cartoes.find((c: any) => c.id === cartaoId)
      : undefined;
    if (!cartao || !Array.isArray(cartao.compras)) return 0;
    return cartao.compras.reduce(
      (total: number, compra: any) => total + (compra.valor || 0),
      0
    );
  }

  getQuantidadeDividasCategoria(categoriaId: string): number {
    const categoria = Array.isArray(this.categorias)
      ? this.categorias.find((c) => c.id === categoriaId)
      : undefined;
    return categoria && Array.isArray(categoria.dividas)
      ? categoria.dividas.length
      : 0;
  }

  getTotalDividasCategoria(categoriaId: string): number {
    const categoria = Array.isArray(this.categorias)
      ? this.categorias.find((c: any) => c.id === categoriaId)
      : undefined;
    if (!categoria || !Array.isArray(categoria.dividas)) return 0;
    return categoria.dividas.reduce(
      (total: number, divida: any) => total + (divida.valor || 0),
      0
    );
  }

  /** Retorna o valor total somado de todos os cartões */
  getValorTotalCartoes(): number {
    if (!Array.isArray(this.cartoes) || this.cartoes.length === 0) return 0;
    return this.cartoes
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

  /** Retorna a quantidade de cartões cadastrados */
  getQuantidadeCartoes(): number {
    return Array.isArray(this.cartoes) ? this.cartoes.length : 0;
  }

  /** Retorna o valor total somado de todas as categorias */
  getValorTotalCategorias(): number {
    if (!Array.isArray(this.categorias) || this.categorias.length === 0)
      return 0;
    return this.categorias
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

  /** Retorna a quantidade de categorias cadastradas */
  getQuantidadeCategorias(): number {
    return Array.isArray(this.categorias) ? this.categorias.length : 0;
  }

  generateGradient(baseColor: string): string {
    const darkColor = this.darkenColor(baseColor, 30);
    return `linear-gradient(135deg, ${baseColor}, ${darkColor})`;
  }

  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00ff) - amt;
    const B = (num & 0x0000ff) - amt;

    const clamp = (val: number) => Math.max(Math.min(255, val), 0);

    return (
      '#' +
      ('0' + clamp(R).toString(16)).slice(-2) +
      ('0' + clamp(G).toString(16)).slice(-2) +
      ('0' + clamp(B).toString(16)).slice(-2)
    );
  }

  removerCartao(id: string) {
    if (!Array.isArray(this.cartoes)) return;
    this.cartoes = this.cartoes.filter((cartao: any) => cartao.id !== id);
  }

  getValorTotalGeral(): number {
    return this.getValorTotalCartoes() + this.getValorTotalCategorias();
  }

  constructor(private firestore: Firestore) {}

  async salvarFirebase(userId: string) {
    if (navigator.onLine) {
      await setDoc(doc(this.firestore, 'financeiro', userId), {
        cartoes: this.cartoes,
        categorias: this.categorias,
      });
    }
  }

  async salvarDadosUsuario(uid: string, dados: any) {
    await setDoc(doc(this.firestore, 'usuarios', uid), dados);
  }
}
