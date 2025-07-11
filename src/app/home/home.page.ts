import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { FinanceiroService } from '../services/financeiro.service';
import { NavController, ModalController } from '@ionic/angular';
import { DividaFormComponent } from '../components/divida-form/divida-form.component';
import { CategoriaFormComponent } from '../components/categoria-form/categoria-form.component';

interface Compromisso {
  id: string;
  nome: string;
  tipo: 'cartao' | 'divida';
  valor: number;
  dia: number;
  cor: string;
  icone: string;
  foiPago?: boolean;
  dataPagamento?: string | null;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, AfterViewInit {
  @ViewChild('scrollDiv', { static: false })
  scrollDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('content', { static: false }) content!: ElementRef;

  abaAtual: 'pendentes' | 'pagos' = 'pendentes';

  compromissosPorDia: { [dia: number]: Compromisso[] } = {};
  compromissosPagosPorDia: { [dia: number]: Compromisso[] } = {};
  compromissosAtrasados: Compromisso[] = [];
  public objectKeys = Object.keys;

  painelAtivoIndex = 0;
  scrollTimeout: any;

  mostrarValor = true;
  painelComSombra = false;

  constructor(
    public financeiroService: FinanceiroService,
    private navCtrl: NavController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.carregarMostrarValor();
    this.carregarCompromissos();
  }

  ngAfterViewInit() {
    setTimeout(() => this.scrollToCenter(this.painelAtivoIndex), 100);

    const ionContent = this.content?.nativeElement;
    if (ionContent) {
      ionContent.addEventListener('scroll', () => {
        this.painelComSombra = ionContent.scrollTop > 10;
      });
    }
  }

  onScroll(event: any) {
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.snapToClosest();
    }, 120);
  }

  snapToClosest() {
    const scrollDiv = this.scrollDiv.nativeElement;
    const boxes = Array.from(
      scrollDiv.querySelectorAll('.painel-box')
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

    this.painelAtivoIndex = closest;
    this.scrollToCenter(closest);
  }

  scrollToCenter(index: number, event?: Event) {
    if (event && (event.target as HTMLElement).closest('ion-icon')) {
      return; // Não faz nada se clicou no olho
    }
    const scrollDiv = this.scrollDiv.nativeElement;
    const boxes = Array.from(
      scrollDiv.querySelectorAll('.painel-box')
    ) as HTMLElement[];
    if (!boxes[index]) return;
    const box = boxes[index];
    const scrollLeft =
      box.offsetLeft - scrollDiv.offsetWidth / 2 + box.offsetWidth / 2;
    scrollDiv.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    this.painelAtivoIndex = index;
  }

  trocarAba(aba: 'pendentes' | 'pagos') {
    this.abaAtual = aba;
  }

  formatarTituloDia(dia: number): string {
    const hoje = new Date().getDate();
    if (dia === hoje) return 'Hoje';
    if (dia === hoje + 1) return 'Amanhã';
    return `Dia ${dia}`;
  }

  carregarCompromissos() {
    const hoje = new Date().getDate();
    const hojeISO = new Date().toISOString().slice(0, 10);
    const compromissos: Compromisso[] = [];

    // Adiciona cartões (cada cartão é um compromisso)
    this.financeiroService.getCartoes().forEach((cartao) => {
      const id = 'cartao-' + cartao.id;
      compromissos.push({
        id,
        nome: cartao.nome,
        tipo: 'cartao',
        valor: cartao.valor,
        dia: cartao.diaVencimento,
        cor: cartao.cor,
        icone: 'card-outline',
        foiPago: this.getStatusPago(id),
        dataPagamento: this.getDataPagamento(id),
      });
    });

    // Adiciona cada dívida de cada categoria
    this.financeiroService.getCategorias().forEach((cat) => {
      if (cat.dividas && cat.dividas.length > 0) {
        cat.dividas.forEach((divida: any, idx: number) => {
          const id = `divida-${cat.id}-${idx}`;
          compromissos.push({
            id,
            nome: divida.nome,
            tipo: 'divida',
            valor: divida.valor,
            dia: divida.diaPagamento,
            cor: cat.cor,
            icone: cat.icone,
            foiPago: this.getStatusPago(id),
            dataPagamento: this.getDataPagamento(id),
          });
        });
      }
    });

    // Separar por status e dia
    this.compromissosPorDia = {};
    this.compromissosPagosPorDia = {};
    this.compromissosAtrasados = [];

    compromissos.forEach((comp) => {
      // Se está pago e foi pago em dia anterior ao hoje, vai para pagos
      if (comp.foiPago && comp.dataPagamento && comp.dataPagamento < hojeISO) {
        if (!this.compromissosPagosPorDia[comp.dia])
          this.compromissosPagosPorDia[comp.dia] = [];
        this.compromissosPagosPorDia[comp.dia].push(comp);
      }
      // Se não está pago e está atrasado
      else if (!comp.foiPago && comp.dia < hoje) {
        this.compromissosAtrasados.push(comp);
      }
      // Se não está pago e não está atrasado
      else if (!comp.foiPago) {
        if (!this.compromissosPorDia[comp.dia])
          this.compromissosPorDia[comp.dia] = [];
        this.compromissosPorDia[comp.dia].push(comp);
      }
      // Se está pago mas foi pago hoje, permanece na aba pendentes/atrasados até o dia seguinte
      else if (comp.foiPago && comp.dataPagamento === hojeISO) {
        if (comp.dia < hoje) {
          this.compromissosAtrasados.push(comp);
        } else {
          if (!this.compromissosPorDia[comp.dia])
            this.compromissosPorDia[comp.dia] = [];
          this.compromissosPorDia[comp.dia].push(comp);
        }
      }
    });

    // Ordenar arrays por dia
    this.compromissosAtrasados.sort((a, b) => a.dia - b.dia);

    const ordenadoPendentes: { [dia: number]: Compromisso[] } = {};
    Object.keys(this.compromissosPorDia)
      .map((k) => parseInt(k, 10))
      .sort((a, b) => a - b)
      .forEach((dia) => {
        ordenadoPendentes[dia] = this.compromissosPorDia[dia];
      });
    this.compromissosPorDia = ordenadoPendentes;

    const ordenadoPagos: { [dia: number]: Compromisso[] } = {};
    Object.keys(this.compromissosPagosPorDia)
      .map((k) => parseInt(k, 10))
      .sort((a, b) => a - b)
      .forEach((dia) => {
        ordenadoPagos[dia] = this.compromissosPagosPorDia[dia];
      });
    this.compromissosPagosPorDia = ordenadoPagos;
  }

  getValorTotalCartao(cartaoId: string): number {
    return this.financeiroService.getValorTotalCartao(cartaoId);
  }

  getStatusPago(id: string): boolean {
    return localStorage.getItem('pago-' + id) === 'true';
  }

  getDataPagamento(id: string): string | null {
    return localStorage.getItem('dataPagamento-' + id) || null;
  }

  alternarStatus(id: string) {
    const atual = this.getStatusPago(id);
    if (!atual) {
      localStorage.setItem('pago-' + id, 'true');
      localStorage.setItem(
        'dataPagamento-' + id,
        new Date().toISOString().slice(0, 10)
      );
    } else {
      localStorage.setItem('pago-' + id, 'false');
      localStorage.removeItem('dataPagamento-' + id);
    }
    this.carregarCompromissos();
  }

  get temCompromissos(): boolean {
    return (
      Object.values(this.compromissosPorDia).some((arr) => arr.length > 0) ||
      this.compromissosAtrasados.length > 0 ||
      Object.values(this.compromissosPagosPorDia).some((arr) => arr.length > 0)
    );
  }

  irParaCarteira() {
    this.navCtrl.navigateForward(['/nav/carteira']);
  }

  async doRefresh(event: any) {
    await this.carregarCompromissosAsync();
    setTimeout(() => {
      event.target.complete();
    }, 1200);
  }

  async carregarCompromissosAsync() {
    this.carregarCompromissos();
  }

  get quantidadeDividas(): number {
    // Some todas as dívidas de todas as categorias
    let total = 0;
    const categorias = this.financeiroService.getCategorias();
    categorias.forEach((cat: any) => {
      if (cat.dividas && Array.isArray(cat.dividas)) {
        total += cat.dividas.length;
      }
    });
    return total;
  }

  get valorTotalCartoes(): number {
    return this.financeiroService.getValorTotalCartoes();
  }

  get quantidadeCartoes(): number {
    return this.financeiroService.getQuantidadeCartoes();
  }

  irParaCartoes() {
    this.navCtrl.navigateForward(['/cartoes']);
  }

  async abrirModalAdicionarCompra() {
    const modal = await this.modalCtrl.create({
      component: DividaFormComponent,
      componentProps: {
        modo: 'cartao',
      },
      breakpoints: [0, 0.8, 0.9],
      initialBreakpoint: 0.9,
      showBackdrop: true,
      backdropDismiss: true,
    });
    modal.onDidDismiss().then(() => this.carregarCompromissos());
    await modal.present();
  }

  async abrirModalAdicionarCartao() {
    const modal = await this.modalCtrl.create({
      component: CategoriaFormComponent,
      componentProps: {
        modo: 'cartao',
      },
      breakpoints: [0, 0.8, 0.9],
      initialBreakpoint: 0.9,
      showBackdrop: true,
      backdropDismiss: true,
    });
    modal.onDidDismiss().then(() => this.carregarCompromissos());
    await modal.present();
  }

  async abrirModalAdicionarCategoria() {
    const modal = await this.modalCtrl.create({
      component: CategoriaFormComponent,
      componentProps: {
        modo: 'categoria',
      },
      breakpoints: [0, 0.8, 0.9],
      initialBreakpoint: 0.9,
      showBackdrop: true,
      backdropDismiss: true,
    });
    modal.onDidDismiss().then(() => this.carregarCompromissos());
    await modal.present();
  }

  async abrirModalAdicionarDivida() {
    const modal = await this.modalCtrl.create({
      component: DividaFormComponent,
      componentProps: {
        modo: 'categoria',
      },
      breakpoints: [0, 0.8, 0.9],
      initialBreakpoint: 0.9,
      showBackdrop: true,
      backdropDismiss: true,
    });
    modal.onDidDismiss().then(() => this.carregarCompromissos());
    await modal.present();
  }

  get dataHojeFormatada(): string {
    const meses = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];
    const hoje = new Date();
    return `${hoje.getDate()} de ${meses[hoje.getMonth()]}`;
  }

  carregarMostrarValor() {
    const salvo = localStorage.getItem('mostrarValorPainel');
    this.mostrarValor = salvo === null ? true : salvo === 'true';
  }

  alternarMostrarValor(event: Event) {
    event.stopPropagation();
    this.mostrarValor = !this.mostrarValor;
    localStorage.setItem('mostrarValorPainel', String(this.mostrarValor));
  }

  get valorTotalCategorias(): number {
    return this.financeiroService.getValorTotalCategorias();
  }

  get quantidadeCategorias(): number {
    return this.financeiroService.getQuantidadeCategorias();
  }

  irParaCategorias() {
    this.navCtrl.navigateForward(['/nav/carteira']);
  }

  get valorTotalGeral(): number {
    return (
      this.financeiroService.getValorTotalCartoes() +
      this.financeiroService.getValorTotalCategorias()
    );
  }
}
