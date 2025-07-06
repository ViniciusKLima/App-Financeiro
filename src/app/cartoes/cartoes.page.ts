import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-cartoes',
  templateUrl: './cartoes.page.html',
  styleUrls: ['./cartoes.page.scss'],
  standalone: false,
})
export class CartoesPage implements AfterViewInit {
  @ViewChild('scrollDiv', { static: false })
  scrollDiv!: ElementRef<HTMLDivElement>;

  cartoes = [
    {
      id: '1',
      nome: 'Nubank',
      valor: 1532.2,
      diaFechamento: 5,
      diaVencimento: 10,
      cor: '#666',
      gradient: '',
      compras: [
        {
          nome: 'Amazon Alexa',
          parcelaAtual: 3,
          totalParcelas: 10,
          valor: 100.0,
        },
        { nome: 'Netflix', parcelaAtual: 1, totalParcelas: 1, valor: 55.9 },
      ],
    },
    {
      id: '2',
      nome: 'Picpay',
      valor: 6244.0,
      diaFechamento: 15,
      diaVencimento: 20,
      cor: '#007BFF',
      gradient: '',
      compras: [
        { nome: 'Curso Udemy', parcelaAtual: 5, totalParcelas: 5, valor: 45.5 },
        { nome: 'Spotify', parcelaAtual: 2, totalParcelas: 12, valor: 19.9 },
      ],
    },
    {
      id: '3',
      nome: 'Master',
      valor: 800.0,
      diaFechamento: 20,
      diaVencimento: 25,
      cor: '#FF5722',
      gradient: '',
      compras: [
        { nome: 'Livro', parcelaAtual: 1, totalParcelas: 3, valor: 60.0 },
      ],
    },
  ];

  cartaoAtivoIndex = 0;

  constructor() {
    this.cartoes.forEach((cartao) => {
      cartao.gradient = this.generateGradient(cartao.cor);
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.scrollToCenter(this.cartaoAtivoIndex), 100);
  }

  get cartaoAtivo() {
    return this.cartoes[this.cartaoAtivoIndex];
  }

  // Detecta o cartão central ao rolar
  onScroll(event: any) {
    const scrollDiv = this.scrollDiv.nativeElement;
    const boxes = Array.from(
      scrollDiv.querySelectorAll('.cartao-box')
    ) as HTMLElement[];
    const scrollCenter = scrollDiv.scrollLeft + scrollDiv.offsetWidth / 2;

    let minDiff = Infinity;
    let closest = 0;

    boxes.forEach((box, i) => {
      const boxCenter = box.offsetLeft + box.offsetWidth / 2;
      const diff = Math.abs(scrollCenter - boxCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closest = i;
      }
    });

    if (closest !== this.cartaoAtivoIndex) {
      this.cartaoAtivoIndex = closest;
    }
  }

  abrirMenuCartao(cartao: any, event: Event) {
    event.stopPropagation();
    // Aqui você pode abrir um popover, modal ou menu de opções
    alert(`Menu do cartão: ${cartao.nome}`);
  }

  // Centraliza o cartão ao abrir a tela
  scrollToCenter(index: number) {
    const scrollDiv = this.scrollDiv.nativeElement;
    const boxes = Array.from(
      scrollDiv.querySelectorAll('.cartao-box')
    ) as HTMLElement[];
    if (!boxes[index]) return;
    const box = boxes[index];
    const scrollLeft =
      box.offsetLeft - scrollDiv.offsetWidth / 2 + box.offsetWidth / 2;
    scrollDiv.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }

  generateGradient(baseColor: string): string {
    const darkColor = this.darkenColor(baseColor, 30);
    return `linear-gradient(135deg, ${baseColor}, ${darkColor})`;
  }

  darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const B = ((num >> 8) & 0x00ff) - amt;
    const G = (num & 0x0000ff) - amt;

    const clamp = (val: number) => Math.max(Math.min(255, val), 0);

    return (
      '#' +
      ('0' + clamp(R).toString(16)).slice(-2) +
      ('0' + clamp(B).toString(16)).slice(-2) +
      ('0' + clamp(G).toString(16)).slice(-2)
    );
  }
}
