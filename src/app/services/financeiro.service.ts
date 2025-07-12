import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FinanceiroService {
  // Cartões com detalhes e compras
  private cartoes: any[] = [];

  // Grupos de dívidas, cada um com suas dívidas
  private categorias: any[] = [];

  private LOCAL_KEY = 'dadosFinanceiros';

  constructor(private firestore: Firestore) {}

  // Salva dados no localStorage
  private salvarLocal() {
    const dados = {
      cartoes: this.cartoes,
      categorias: this.categorias,
    };
    localStorage.setItem(this.LOCAL_KEY, JSON.stringify(dados));
  }

  // Carrega dados do localStorage
  carregarLocal() {
    const dados = localStorage.getItem(this.LOCAL_KEY);
    if (dados) {
      const obj = JSON.parse(dados);
      this.cartoes = obj.cartoes || [];
      this.categorias = obj.categorias || [];
    }
  }

  // Salva dados no Firestore
  async salvarFirebase(userId: string) {
    if (navigator.onLine) {
      await setDoc(doc(this.firestore, 'financeiro', userId), {
        cartoes: this.cartoes,
        categorias: this.categorias,
      });
      this.salvarLocal();
    }
  }

  // Carrega dados do Firestore
  async carregarFirebase(userId: string) {
    if (navigator.onLine) {
      const docRef = doc(this.firestore, 'financeiro', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const dados = docSnap.data();
        this.cartoes = dados['cartoes'] || [];
        this.categorias = dados['categorias'] || [];
        this.salvarLocal();
      } else {
        this.cartoes = [];
        this.categorias = [];
        this.salvarLocal();
      }
    } else {
      this.carregarLocal();
    }
  }

  // Salva dados extras do usuário
  async salvarDadosUsuario(uid: string, dados: any) {
    await setDoc(doc(this.firestore, 'usuarios', uid), dados);
  }

  // Carrega dados extras do usuário
  async carregarDadosUsuario(uid: string) {
    const docRef = doc(this.firestore, 'usuarios', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  }

  // Métodos de acesso e manipulação dos dados
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
    this.salvarLocal();
  }

  updateCartao(cartaoEditado: any) {
    if (!Array.isArray(this.cartoes) || this.cartoes.length === 0) return;
    const idx = this.cartoes.findIndex(
      (cartao) => cartao.id === cartaoEditado.id
    );
    if (idx !== -1) {
      this.cartoes[idx] = { ...this.cartoes[idx], ...cartaoEditado };
      this.salvarLocal();
    }
  }

  removerCartao(id: string, uid?: string) {
    if (!Array.isArray(this.cartoes)) return;
    this.cartoes = this.cartoes.filter((cartao: any) => cartao.id !== id);
    this.salvarLocal();
    if (uid) {
      this.salvarFirebase(uid); // Salva no Firestore após remover
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

  addCategoria(categoria: any) {
    if (!Array.isArray(this.categorias)) return;
    categoria.id = (Math.random() * 100000).toFixed(0);
    this.categorias.push({ ...categoria, dividas: [] });
    this.salvarLocal();
  }

  updateCategoria(categoriaEditada: any) {
    if (!Array.isArray(this.categorias) || this.categorias.length === 0) return;
    const idx = this.categorias.findIndex(
      (cat) => cat.id === categoriaEditada.id
    );
    if (idx !== -1) {
      this.categorias[idx] = { ...this.categorias[idx], ...categoriaEditada };
      this.salvarLocal();
    }
  }

  async excluirCategoria(uid: string, categoriaId: string) {
    // Remove do array local
    this.categorias = this.categorias.filter(
      (cat: any) => cat.id !== categoriaId
    );
    this.salvarLocal();
    // Salva no Firestore
    await this.salvarFirebase(uid);
  }

  removerCategoria(id: string) {
    if (!Array.isArray(this.categorias)) return;
    this.categorias = this.categorias.filter((cat: any) => cat.id !== id);
    this.salvarLocal();
  }

  // Métodos de cálculo e utilitários
  getValorTotalDividas(): number {
    let total = 0;
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

  getQuantidadeCartoes(): number {
    return Array.isArray(this.cartoes) ? this.cartoes.length : 0;
  }

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

  getValorTotalGeral(): number {
    return this.getValorTotalCartoes() + this.getValorTotalCategorias();
  }

  async carregarCategoriasDoFirebase(uid: string) {
    const docRef = doc(this.firestore, 'financeiro', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      this.categorias = data['categorias'] || [];
      this.salvarLocal(); // Atualiza o localStorage também
      return this.categorias;
    }
    return [];
  }
}
