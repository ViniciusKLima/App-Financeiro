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
          descricao: 'Assinatura mensal da Alexa',
        },
        {
          nome: 'Netflix',
          parcelaAtual: 1,
          totalParcelas: 1,
          valor: 55.9,
          descricao: 'Plano básico mensal',
        },
        {
          nome: 'Uber',
          parcelaAtual: 1,
          totalParcelas: 1,
          valor: 32.5,
          descricao: 'Corrida Uber',
        },
        {
          nome: 'Farmácia',
          parcelaAtual: 1,
          totalParcelas: 2,
          valor: 80.0,
          descricao: 'Medicamentos',
        },
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
        {
          nome: 'Curso Udemy',
          parcelaAtual: 5,
          totalParcelas: 5,
          valor: 45.5,
          descricao: 'Curso online de programação',
        },
        {
          nome: 'Spotify',
          parcelaAtual: 2,
          totalParcelas: 12,
          valor: 19.9,
          descricao: 'Assinatura música',
        },
        {
          nome: 'Livraria',
          parcelaAtual: 1,
          totalParcelas: 1,
          valor: 120.0,
          descricao: 'Compra de livros',
        },
        {
          nome: 'Padaria',
          parcelaAtual: 1,
          totalParcelas: 1,
          valor: 18.0,
          descricao: 'Pães e lanches',
        },
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
        {
          nome: 'Livro',
          parcelaAtual: 1,
          totalParcelas: 3,
          valor: 60.0,
          descricao: 'Livro técnico',
        },
        {
          nome: 'Restaurante',
          parcelaAtual: 1,
          totalParcelas: 1,
          valor: 150.0,
          descricao: 'Almoço com amigos',
        },
        {
          nome: 'Cinema',
          parcelaAtual: 1,
          totalParcelas: 1,
          valor: 40.0,
          descricao: 'Ingresso de cinema',
        },
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
        {
          nome: 'iFood',
          parcelaAtual: 1,
          totalParcelas: 1,
          valor: 60.0,
          descricao: 'Pedido de comida',
        },
        {
          nome: 'Assinatura Deezer',
          parcelaAtual: 2,
          totalParcelas: 12,
          valor: 19.9,
          descricao: 'Música online',
        },
        {
          nome: 'Posto',
          parcelaAtual: 1,
          totalParcelas: 1,
          valor: 120.0,
          descricao: 'Combustível',
        },
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
        {
          nome: 'Amazon Alexa',
          diaPagamento: 3,
          valor: 104.0,
          descricao: 'Assinatura Alexa',
        },
        {
          nome: 'Lanche',
          diaPagamento: 4,
          valor: 100.0,
          descricao: 'Lanche do dia',
        },
        {
          nome: 'Água',
          diaPagamento: 7,
          valor: 80.0,
          descricao: 'Conta de água',
        },
        {
          nome: 'Luz',
          diaPagamento: 10,
          valor: 200.0,
          descricao: 'Conta de energia',
        },
        {
          nome: 'Internet',
          diaPagamento: 12,
          valor: 120.0,
          descricao: 'Plano internet',
        },
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
        {
          nome: 'Curso Udemy',
          diaPagamento: 10,
          valor: 200.0,
          descricao: 'Curso profissionalizante',
        },
        {
          nome: 'Notebook',
          diaPagamento: 15,
          valor: 3000.0,
          descricao: 'Parcelamento notebook',
        },
        {
          nome: 'Mouse',
          diaPagamento: 18,
          valor: 150.0,
          descricao: 'Mouse gamer',
        },
        {
          nome: 'Cadeira',
          diaPagamento: 20,
          valor: 400.0,
          descricao: 'Cadeira ergonômica',
        },
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
        {
          nome: 'Aluguel',
          diaPagamento: 5,
          valor: 1200.0,
          descricao: 'Aluguel mensal',
        },
        {
          nome: 'Energia',
          diaPagamento: 10,
          valor: 250.0,
          descricao: 'Conta de energia',
        },
        {
          nome: 'Condomínio',
          diaPagamento: 8,
          valor: 300.0,
          descricao: 'Taxa condomínio',
        },
        {
          nome: 'Gás',
          diaPagamento: 12,
          valor: 100.0,
          descricao: 'Botijão de gás',
        },
        {
          nome: 'Mercado',
          diaPagamento: 15,
          valor: 150.0,
          descricao: 'Compras de supermercado',
        },
        {
          nome: 'Manutenção',
          diaPagamento: 25,
          valor: 65.38,
          descricao: 'Manutenção casa',
        },
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
        {
          nome: 'IPVA',
          diaPagamento: 20,
          valor: 900.0,
          descricao: 'IPVA anual',
        },
        {
          nome: 'Seguro',
          diaPagamento: 15,
          valor: 350.0,
          descricao: 'Seguro do veículo',
        },
        {
          nome: 'Combustível',
          diaPagamento: 22,
          valor: 1981.6,
          descricao: 'Abastecimento',
        },
      ],
    },
    {
      id: '5',
      nome: 'Lazer',
      valor: '205.76',
      quantDividas: 3,
      icone: 'football-outline',
      cor: '#6F42C1',
      dividas: [
        {
          nome: 'Cinema',
          diaPagamento: 12,
          valor: 50.0,
          descricao: 'Ingresso de cinema',
        },
        {
          nome: 'Restaurante',
          diaPagamento: 18,
          valor: 80.0,
          descricao: 'Jantar',
        },
        {
          nome: 'Viagem',
          diaPagamento: 28,
          valor: 75.76,
          descricao: 'Passeio de final de semana',
        },
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
        {
          nome: 'Roupas',
          diaPagamento: 8,
          valor: 200.0,
          descricao: 'Compra de roupas',
        },
        {
          nome: 'Presentes',
          diaPagamento: 22,
          valor: 150.0,
          descricao: 'Presentes para família',
        },
        {
          nome: 'Eletrônicos',
          diaPagamento: 28,
          valor: 150.0,
          descricao: 'Compras eletrônicas',
        },
      ],
    },
  ];

  getValorTotalDividas(): number {
    let total = 0;
    // Soma todas as dívidas de todas as categorias
    this.categorias.forEach((cat) => {
      if (cat.dividas && cat.dividas.length > 0) {
        cat.dividas.forEach((divida) => {
          total += Number(divida.valor) || 0;
        });
      }
    });
    // Soma todos os cartões
    this.cartoes.forEach((cartao) => {
      total += Number(cartao.valor) || 0;
    });
    return total;
  }

  getCartoes() {
    return this.cartoes;
  }

  getCartaoById(id: string) {
    return this.cartoes.find((cartao) => cartao.id === id);
  }

  addCartao(cartao: any) {
    cartao.id = (Math.random() * 100000).toFixed(0);
    cartao.compras = [];
    this.cartoes.push({ ...cartao });
  }

  addCategoria(categoria: any) {
    // Gera um id simples (pode ser melhorado)
    categoria.id = (Math.random() * 100000).toFixed(0);
    this.categorias.push({ ...categoria, dividas: [] });
  }

  updateCategoria(categoriaEditada: any) {
    const idx = this.categorias.findIndex(
      (cat) => cat.id === categoriaEditada.id
    );
    if (idx !== -1) {
      this.categorias[idx] = { ...this.categorias[idx], ...categoriaEditada };
    }
  }

  updateCartao(cartaoEditado: any) {
    const idx = this.cartoes.findIndex(
      (cartao) => cartao.id === cartaoEditado.id
    );
    if (idx !== -1) {
      this.cartoes[idx] = { ...this.cartoes[idx], ...cartaoEditado };
    }
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
