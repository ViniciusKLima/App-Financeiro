import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FinanceiroService {
  // Cartões com detalhes e compras
  private cartoes = [
    {
      id: '1',
      nome: 'Nubank',
      valor: 1532.2,
      diaFechamento: 5,
      diaVencimento: 10,
      cor: '#8A05BE', // Roxo Nubank
      gradient: '',
      compras: [
        {
          nome: 'Amazon Alexa',
          parcelaAtual: 3,
          totalParcelas: 10,
          valor: 100.0,
        },
        { nome: 'Netflix', parcelaAtual: 1, totalParcelas: 1, valor: 55.9 },
        { nome: 'Uber', parcelaAtual: 1, totalParcelas: 1, valor: 32.5 },
        { nome: 'Farmácia', parcelaAtual: 1, totalParcelas: 2, valor: 80.0 },
      ],
    },
    {
      id: '2',
      nome: 'PicPay',
      valor: 6244.0,
      diaFechamento: 15,
      diaVencimento: 20,
      cor: '#21C25E', // Verde PicPay
      gradient: '',
      compras: [
        { nome: 'Curso Udemy', parcelaAtual: 5, totalParcelas: 5, valor: 45.5 },
        { nome: 'Spotify', parcelaAtual: 2, totalParcelas: 12, valor: 19.9 },
        { nome: 'Livraria', parcelaAtual: 1, totalParcelas: 1, valor: 120.0 },
        { nome: 'Padaria', parcelaAtual: 1, totalParcelas: 1, valor: 18.0 },
      ],
    },
    {
      id: '3',
      nome: 'Master',
      valor: 800.0,
      diaFechamento: 20,
      diaVencimento: 25,
      cor: '#F79E1B', // Laranja MasterCard
      gradient: '',
      compras: [
        { nome: 'Livro', parcelaAtual: 1, totalParcelas: 3, valor: 60.0 },
        {
          nome: 'Restaurante',
          parcelaAtual: 1,
          totalParcelas: 1,
          valor: 150.0,
        },
        { nome: 'Cinema', parcelaAtual: 1, totalParcelas: 1, valor: 40.0 },
      ],
    },
    {
      id: '4',
      nome: 'Neon',
      valor: 1200.0,
      diaFechamento: 8,
      diaVencimento: 13,
      cor: '#00E1E6', // Azul Neon
      gradient: '',
      compras: [
        { nome: 'iFood', parcelaAtual: 1, totalParcelas: 1, valor: 60.0 },
        {
          nome: 'Assinatura Deezer',
          parcelaAtual: 2,
          totalParcelas: 12,
          valor: 19.9,
        },
        { nome: 'Posto', parcelaAtual: 1, totalParcelas: 1, valor: 120.0 },
      ],
    },
  ];

  // Grupos de dívidas, cada um com suas dívidas
  private categorias = [
    {
      id: '1',
      nome: 'Boletos',
      valor: '1532.20',
      quantDividas: 5,
      icone: 'document-text-outline',
      cor: '#666',
      dividas: [
        { nome: 'Amazon Alexa', diaPagamento: 3, valor: 104.0 },
        { nome: 'Lanche', diaPagamento: 4, valor: 100.0 },
        { nome: 'Água', diaPagamento: 7, valor: 80.0 },
        { nome: 'Luz', diaPagamento: 10, valor: 200.0 },
        { nome: 'Internet', diaPagamento: 12, valor: 120.0 },
      ],
    },
    {
      id: '2',
      nome: 'Trabalho',
      valor: '6244.00',
      quantDividas: 4,
      icone: 'card-outline',
      cor: '#007BFF',
      dividas: [
        { nome: 'Curso Udemy', diaPagamento: 10, valor: 200.0 },
        { nome: 'Notebook', diaPagamento: 15, valor: 3000.0 },
        { nome: 'Mouse', diaPagamento: 18, valor: 150.0 },
        { nome: 'Cadeira', diaPagamento: 20, valor: 400.0 },
      ],
    },
    {
      id: '3',
      nome: 'Casa',
      valor: '2065.38',
      quantDividas: 6,
      icone: 'home-outline',
      cor: '#08a708',
      dividas: [
        { nome: 'Aluguel', diaPagamento: 5, valor: 1200.0 },
        { nome: 'Energia', diaPagamento: 10, valor: 250.0 },
        { nome: 'Condomínio', diaPagamento: 8, valor: 300.0 },
        { nome: 'Gás', diaPagamento: 12, valor: 100.0 },
        { nome: 'Mercado', diaPagamento: 15, valor: 150.0 },
        { nome: 'Manutenção', diaPagamento: 25, valor: 65.38 },
      ],
    },
    {
      id: '4',
      nome: 'Carro',
      valor: '3231.60',
      quantDividas: 3,
      icone: 'car-outline',
      cor: '#ffa600',
      dividas: [
        { nome: 'IPVA', diaPagamento: 20, valor: 900.0 },
        { nome: 'Seguro', diaPagamento: 15, valor: 350.0 },
        { nome: 'Combustível', diaPagamento: 22, valor: 1981.6 },
      ],
    },
    {
      id: '5',
      nome: 'Lazer',
      valor: '205.76',
      quantDividas: 2,
      icone: 'football-outline',
      cor: '#6F42C1',
      dividas: [
        { nome: 'Cinema', diaPagamento: 12, valor: 50.0 },
        { nome: 'Restaurante', diaPagamento: 18, valor: 80.0 },
        { nome: 'Viagem', diaPagamento: 28, valor: 75.76 },
      ],
    },
    {
      id: '6',
      nome: 'Compras Diversas',
      valor: '500.00',
      quantDividas: 3,
      icone: 'cart-outline',
      cor: '#FF1493',
      dividas: [
        { nome: 'Roupas', diaPagamento: 8, valor: 200.0 },
        { nome: 'Presentes', diaPagamento: 22, valor: 150.0 },
        { nome: 'Eletrônicos', diaPagamento: 28, valor: 150.0 },
      ],
    },
  ];

  getCartoes() {
    return this.cartoes;
  }

  getCartaoById(id: string) {
    return this.cartoes.find((cartao) => cartao.id === id);
  }

  getCategorias() {
    return this.categorias;
  }

  getCategoriaById(id: string) {
    return this.categorias.find((cat) => cat.id === id);
  }

  getValorTotalCartao(cartaoId: string): number {
    const cartao = this.cartoes.find((c) => c.id === cartaoId);
    if (!cartao || !cartao.compras) return 0;
    return cartao.compras.reduce(
      (total, compra) => total + (compra.valor || 0),
      0
    );
  }

  getQuantidadeDividasCategoria(categoriaId: string): number {
    const categoria = this.categorias.find((c) => c.id === categoriaId);
    return categoria && categoria.dividas ? categoria.dividas.length : 0;
  }

  getTotalDividasCategoria(categoriaId: string): number {
    const categoria = this.categorias.find((c) => c.id === categoriaId);
    if (!categoria || !categoria.dividas) return 0;
    return categoria.dividas.reduce(
      (total, divida) => total + (divida.valor || 0),
      0
    );
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
}
