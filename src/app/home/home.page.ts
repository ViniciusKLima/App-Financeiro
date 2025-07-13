import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { FinanceiroFacadeService } from '../services/financeiro-facade.service';
import { NavController, ModalController } from '@ionic/angular';
import { DividaFormComponent } from '../components/divida-form/divida-form.component';
import { CategoriaFormComponent } from '../components/categoria-form/categoria-form.component';
import { Subscription } from 'rxjs';

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
export class HomePage implements OnInit, AfterViewInit, OnDestroy {
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

  private dadosSubscription?: Subscription;

  constructor(
    // public financeiroService: FinanceiroService, // ❌ Remover depois
    public financeiroFacade: FinanceiroFacadeService, // ✅ Novo
    private navCtrl: NavController,
    private modalCtrl: ModalController
  ) {}

  async ngOnInit() {
    const uid = localStorage.getItem('uid');
    if (uid) {
      // await this.financeiroService.carregarFirebase(uid); // ❌ Antigo
      await this.financeiroFacade.inicializar(uid); // ✅ Novo
      this.carregarCompromissos();
    }

    // this.dadosSubscription = this.financeiroService.dadosAtualizados$.subscribe( // ❌ Antigo
    this.dadosSubscription = this.financeiroFacade.dadosAtualizados$.subscribe(
      // ✅ Novo
      (dados) => {
        console.log('📱 Home atualizada automaticamente');
        this.carregarCompromissos();
      }
    );
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

  ngOnDestroy() {
    if (this.dadosSubscription) {
      this.dadosSubscription.unsubscribe();
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

  async carregarCompromissos() {
    const hoje = new Date().getDate();
    const compromissos: Compromisso[] = [];

    // ✅ Corrigir método
    const uid = localStorage.getItem('uid');
    if (uid) {
      await this.financeiroFacade.carregarStatusPagamentos(uid);
    }

    // Adiciona cartões
    this.financeiroFacade.getCartoes().forEach((cartao) => {
      const id = 'cartao-' + cartao.id;
      compromissos.push({
        id,
        nome: cartao.nome,
        tipo: 'cartao',
        valor: this.financeiroFacade.getValorTotalCartao(cartao.id),
        dia: cartao.diaVencimento,
        cor: cartao.cor,
        icone: 'card-outline',
        foiPago: this.getStatusPago(id),
        dataPagamento: this.getDataPagamento(id),
      });
    });

    // Adiciona dívidas
    this.financeiroFacade.getCategorias().forEach((cat) => {
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

    // Separar por status
    this.compromissosPorDia = {};
    this.compromissosPagosPorDia = {};
    this.compromissosAtrasados = [];

    compromissos.forEach((comp) => {
      if (comp.foiPago) {
        // Se está pago, vai para aba pagos
        if (!this.compromissosPagosPorDia[comp.dia])
          this.compromissosPagosPorDia[comp.dia] = [];
        this.compromissosPagosPorDia[comp.dia].push(comp);
      } else if (comp.dia < hoje) {
        // Se não está pago e está atrasado
        this.compromissosAtrasados.push(comp);
      } else {
        // Se não está pago e não está atrasado
        if (!this.compromissosPorDia[comp.dia])
          this.compromissosPorDia[comp.dia] = [];
        this.compromissosPorDia[comp.dia].push(comp);
      }
    });

    // Ordenar arrays
    this.compromissosAtrasados.sort((a, b) => a.dia - b.dia);
    this.ordenarCompromissos();
  }

  ordenarCompromissos() {
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
    return this.financeiroFacade.getValorTotalCartao(cartaoId);
  }

  getStatusPago(id: string): boolean {
    return localStorage.getItem('pago-' + id) === 'true';
  }

  getDataPagamento(id: string): string | null {
    return localStorage.getItem('dataPagamento-' + id) || null;
  }

  async alternarStatus(id: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    const atual = this.getStatusPago(id);
    const uid = localStorage.getItem('uid');

    if (!atual) {
      // Marca como pago
      localStorage.setItem('pago-' + id, 'true');
      localStorage.setItem(
        'dataPagamento-' + id,
        new Date().toISOString().slice(0, 10)
      );

      // ✅ Corrigir método
      if (uid) {
        await this.financeiroFacade.salvarStatusPagamento(uid, id, true);
      }

      this.animarPagamento(id, 'pago');
    } else {
      // Desmarca como pago
      localStorage.setItem('pago-' + id, 'false');
      localStorage.removeItem('dataPagamento-' + id);

      // ✅ Corrigir método
      if (uid) {
        await this.financeiroFacade.salvarStatusPagamento(uid, id, false);
      }

      this.animarPagamento(id, 'despago');
    }

    // Recarrega os compromissos após a animação
    setTimeout(() => {
      this.carregarCompromissos();
    }, 800);
  }

  animarPagamento(id: string, tipo: 'pago' | 'despago') {
    const elemento = document.querySelector(`[data-id="${id}"]`) as HTMLElement;
    if (elemento) {
      elemento.style.transition = 'all 0.6s ease-out';
      elemento.style.position = 'relative';
      elemento.style.zIndex = '10';

      if (tipo === 'pago') {
        // Animação para pago: verde e desliza para direita
        elemento.style.backgroundColor = '#4CAF50';
        elemento.style.color = '#fff';
        elemento.style.transform = 'scale(1.05)';
        elemento.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.4)';

        setTimeout(() => {
          elemento.style.transform = 'translateX(120%) scale(0.8)';
          elemento.style.opacity = '0';
          elemento.style.filter = 'blur(2px)';
        }, 200);
      } else {
        // Animação para despago: azul e desliza para esquerda
        elemento.style.backgroundColor = '#2196F3';
        elemento.style.color = '#fff';
        elemento.style.transform = 'scale(1.05)';
        elemento.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.4)';

        setTimeout(() => {
          elemento.style.transform = 'translateX(-120%) scale(0.8)';
          elemento.style.opacity = '0';
          elemento.style.filter = 'blur(2px)';
        }, 200);
      }

      // Opcional: adicionar texto de feedback
      const feedback = document.createElement('div');
      feedback.style.position = 'absolute';
      feedback.style.top = '50%';
      feedback.style.left = '50%';
      feedback.style.transform = 'translate(-50%, -50%)';
      feedback.style.color = '#fff';
      feedback.style.fontWeight = 'bold';
      feedback.style.fontSize = '14px';
      feedback.style.zIndex = '20';
      feedback.style.opacity = '0';
      feedback.style.transition = 'opacity 0.3s ease';
      feedback.textContent = tipo === 'pago' ? '✓ Pago' : '↺ Despago';

      elemento.appendChild(feedback);

      setTimeout(() => {
        feedback.style.opacity = '1';
      }, 100);

      setTimeout(() => {
        feedback.style.opacity = '0';
      }, 500);
    }
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
    let totalDividas = 0;
    // Soma dívidas das categorias
    const categorias = this.financeiroFacade.getCategorias();
    categorias.forEach((cat: any) => {
      if (cat.dividas && Array.isArray(cat.dividas)) {
        totalDividas += cat.dividas.length;
      }
    });
    // Soma cartões (cada cartão conta como 1 dívida)
    const cartoes = this.financeiroFacade.getCartoes();
    totalDividas += cartoes.length;
    return totalDividas;
  }

  get valorTotalCartoes(): number {
    return this.financeiroFacade.getValorTotalCartoes();
  }

  get quantidadeCartoes(): number {
    return this.financeiroFacade.getQuantidadeCartoes();
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
    return this.financeiroFacade.getValorTotalCategorias();
  }

  get quantidadeCategorias(): number {
    return this.financeiroFacade.getQuantidadeCategorias();
  }

  irParaCategorias() {
    this.navCtrl.navigateForward(['/nav/carteira']);
  }

  get valorTotalGeral(): number {
    return (
      this.financeiroFacade.getValorTotalCartoes() +
      this.financeiroFacade.getValorTotalCategorias()
    );
  }
}
