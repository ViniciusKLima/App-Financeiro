import { Injectable } from '@angular/core';
import { FirebaseService } from '../core/firebase.service';
import { StorageService } from '../core/storage.service';

@Injectable({
  providedIn: 'root',
})
export class CartaoService {
  private cartoes: any[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private storageService: StorageService
  ) {}

  // Getters
  getCartoes() {
    return Array.isArray(this.cartoes) ? this.cartoes : [];
  }

  getCartaoById(id: string) {
    return Array.isArray(this.cartoes) && this.cartoes.length > 0
      ? this.cartoes.find((cartao) => cartao.id === id)
      : undefined;
  }

  // CRUD de cartões
  async criarCartao(cartao: any, uid?: string): Promise<any> {
    // ✅ Verifica se já existe para evitar duplicação
    const existe = this.cartoes.find((c) => c.nome === cartao.nome);
    if (existe) {
      console.warn('⚠️ Cartão já existe:', cartao.nome);
      return existe;
    }

    const novoCartao = {
      id: this.gerarId(),
      nome: cartao.nome,
      cor: cartao.cor,
      diaFechamento: cartao.diaFechamento,
      diaVencimento: cartao.diaVencimento,
      somarAoTotal: cartao.somarAoTotal ?? true,
      compras: cartao.compras || [],
    };

    // ✅ Adiciona à lista local
    this.cartoes.push(novoCartao);
    this.salvarLocal();

    // ✅ Salva no Firebase
    if (uid) {
      await this.salvarFirebase(uid);
    }

    console.log('✅ Cartão criado:', novoCartao);
    return novoCartao;
  }

  async atualizarCartao(cartaoEditado: any, uid?: string) {
    if (!Array.isArray(this.cartoes) || this.cartoes.length === 0) return;
    const idx = this.cartoes.findIndex(
      (cartao) => cartao.id === cartaoEditado.id
    );
    if (idx !== -1) {
      this.cartoes[idx] = { ...this.cartoes[idx], ...cartaoEditado };
      this.salvarLocal();

      if (uid) {
        await this.salvarFirebase(uid);
      }
    }
  }

  async excluirCartao(id: string, uid?: string) {
    if (!Array.isArray(this.cartoes)) return;
    this.cartoes = this.cartoes.filter((cartao: any) => cartao.id !== id);
    this.salvarLocal();

    if (uid) {
      await this.salvarFirebase(uid);
    }
  }

  // Métodos de geração de gradiente
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

  // Persistência
  carregarLocal() {
    const dados = this.storageService.carregarDados();
    this.cartoes = dados.cartoes;
  }

  salvarLocal() {
    const dados = this.storageService.carregarDados();
    dados.cartoes = this.cartoes;
    this.storageService.salvarDados(dados);
  }

  async carregarFirebase(uid: string) {
    try {
      const dados = await this.firebaseService.carregarDados(uid);
      if (dados && dados['cartoes']) {
        this.cartoes = dados['cartoes'];
        this.salvarLocal();
      }
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
      this.carregarLocal();
    }
  }

  async salvarFirebase(uid: string) {
    await this.firebaseService.salvarDados(uid, { cartoes: this.cartoes });
  }

  // Método para sincronizar dados do listener
  sincronizarDados(cartoes: any[]) {
    console.log('🔄 Cartão Service - Sincronizando dados:', cartoes);

    // ✅ SUBSTITUI completamente em vez de adicionar
    this.cartoes = Array.isArray(cartoes) ? [...cartoes] : [];

    this.salvarLocal();
    console.log('✅ Cartão Service - Dados sincronizados:', this.cartoes);
  }

  // ✅ Método para verificar duplicação
  private gerarId(): string {
    let id: string;
    do {
      id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    } while (this.cartoes.some((c) => c.id === id));
    return id;
  }
}
