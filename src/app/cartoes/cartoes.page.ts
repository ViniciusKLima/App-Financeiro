import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FinanceiroService } from '../services/financeiro.service';

@Component({
  selector: 'app-cartoes',
  templateUrl: './cartoes.page.html',
  styleUrls: ['./cartoes.page.scss'],
  standalone: false,
})
export class CartoesPage implements AfterViewInit {
  @ViewChild('scrollDiv', { static: false })
  scrollDiv!: ElementRef<HTMLDivElement>;

  cartoes: any[] = [];
  cartaoAtivoIndex = 0;

  constructor(public financeiroService: FinanceiroService) {
    this.cartoes = this.financeiroService.getCartoes().map((cartao: any) => ({
      ...cartao,
      gradient: this.financeiroService.generateGradient(cartao.cor),
    }));
  }

  ngAfterViewInit() {
    setTimeout(() => this.scrollToCenter(this.cartaoAtivoIndex), 100);
  }

  get cartaoAtivo() {
    return this.cartoes[this.cartaoAtivoIndex];
  }

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

  abrirMenuCartao(cartao: any, event: Event) {
    event.stopPropagation();
    // Implemente aqui o menu de opções do cartão
    alert(`Menu do cartão: ${cartao.nome}`);
  }
}
