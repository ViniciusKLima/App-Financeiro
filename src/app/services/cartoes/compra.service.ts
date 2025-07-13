import { Injectable } from '@angular/core';
import { CartaoService } from './cartao.service';

@Injectable({
  providedIn: 'root',
})
export class CompraService {
  constructor(private cartaoService: CartaoService) {}

  // Adicionar compra em cartão
  async adicionarCompra(cartaoId: string, compra: any, uid?: string) {
    const cartao = this.cartaoService.getCartaoById(cartaoId);
    if (!cartao) {
      throw new Error('Cartão não encontrado');
    }

    if (!cartao.compras) {
      cartao.compras = [];
    }

    const novaCompra = {
      id: Date.now().toString(),
      ...compra,
    };

    cartao.compras.push(novaCompra);

    if (uid) {
      await this.cartaoService.salvarFirebase(uid);
    }

    return novaCompra;
  }

  // Editar compra em cartão
  async editarCompra(
    cartaoId: string,
    compraIndex: number,
    compraEditada: any,
    uid?: string
  ) {
    const cartao = this.cartaoService.getCartaoById(cartaoId);
    if (
      !cartao ||
      !cartao.compras ||
      compraIndex < 0 ||
      compraIndex >= cartao.compras.length
    ) {
      throw new Error('Compra não encontrada');
    }

    cartao.compras[compraIndex] = {
      ...cartao.compras[compraIndex],
      ...compraEditada,
    };

    if (uid) {
      await this.cartaoService.salvarFirebase(uid);
    }

    return cartao.compras[compraIndex];
  }

  // Remover compra do cartão
  async removerCompra(cartaoId: string, compraIndex: number, uid?: string) {
    const cartao = this.cartaoService.getCartaoById(cartaoId);
    if (
      !cartao ||
      !cartao.compras ||
      compraIndex < 0 ||
      compraIndex >= cartao.compras.length
    ) {
      throw new Error('Compra não encontrada');
    }

    const compraRemovida = cartao.compras.splice(compraIndex, 1)[0];

    if (uid) {
      await this.cartaoService.salvarFirebase(uid);
    }

    return compraRemovida;
  }
}
