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

  // ✅ Inicializar com valores padrão
  compromissosPorDia: { [dia: number]: Compromisso[] } = {};
  compromissosPagosPorDia: { [dia: number]: Compromisso[] } = {};
  compromissosAtrasados: Compromisso[] = [];

  public objectKeys = Object.keys;

  painelAtivoIndex = 0;
  scrollTimeout: any;

  mostrarValor = true;
  painelComSombra = false;

  private dadosSubscription?: Subscription;

  // ✅ Adicione estas propriedades
  carregandoDados = true;
  primeiraVezCarregando = true;

  constructor(
    public financeiroFacade: FinanceiroFacadeService,
    private navCtrl: NavController,
    private modalCtrl: ModalController
  ) {
    // ✅ Garantir inicialização no construtor também
    this.compromissosPorDia = {};
    this.compromissosPagosPorDia = {};
    this.compromissosAtrasados = [];
  }

  async ngOnInit() {
    this.carregandoDados = true;
    this.primeiraVezCarregando = true;

    const uid = localStorage.getItem('uid');
    if (uid) {
      await this.financeiroFacade.inicializar(uid);
      await this.carregarCompromissos();
    }

    // ✅ Finaliza o loading
    this.carregandoDados = false;
    this.primeiraVezCarregando = false;

    this.dadosSubscription = this.financeiroFacade.dadosAtualizados$.subscribe(
      async (dados) => {
        console.log('📱 Home atualizada automaticamente');
        // ✅ Loading mais rápido para atualizações
        this.carregandoDados = true;
        await this.carregarCompromissos();
        this.carregandoDados = false;
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
    // ✅ Verificar se o dia é um número válido
    if (isNaN(dia) || dia === null || dia === undefined) {
      console.warn('Dia inválido recebido:', dia);
      return 'Dia inválido';
    }

    const hoje = new Date().getDate();

    // ✅ Converter para número inteiro se necessário
    const diaNumero = parseInt(dia.toString(), 10);

    if (isNaN(diaNumero)) {
      console.warn('Não foi possível converter dia para número:', dia);
      return 'Dia inválido';
    }

    if (diaNumero === hoje) return 'Hoje';
    if (diaNumero === hoje + 1) return 'Amanhã';
    if (diaNumero === hoje - 1) return 'Ontem';

    // ✅ Validar se o dia está entre 1 e 31
    if (diaNumero < 1 || diaNumero > 31) {
      console.warn('Dia fora do range válido:', diaNumero);
      return `Dia ${diaNumero}`;
    }

    return `Dia ${diaNumero}`;
  }

  async carregarCompromissos() {
    const hoje = new Date().getDate();
    const compromissos: Compromisso[] = [];

    const uid = localStorage.getItem('uid');
    if (uid) {
      await this.financeiroFacade.carregarStatusPagamentos(uid);
    }

    // ✅ Verificar se os serviços retornam dados válidos
    const cartoes = this.financeiroFacade.getCartoes() || [];
    const categorias = this.financeiroFacade.getCategorias() || [];

    // Adiciona cartões
    cartoes.forEach((cartao) => {
      if (!cartao || !cartao.id) return;

      // ✅ Validar diaVencimento
      const diaVencimento = parseInt(cartao.diaVencimento);
      if (isNaN(diaVencimento) || diaVencimento < 1 || diaVencimento > 31) {
        console.warn(
          'Dia de vencimento inválido no cartão:',
          cartao.nome,
          diaVencimento
        );
        return; // Pula este cartão
      }

      const id = 'cartao-' + cartao.id;
      compromissos.push({
        id,
        nome: cartao.nome || 'Cartão sem nome',
        tipo: 'cartao',
        valor: this.financeiroFacade.getValorTotalCartao(cartao.id) || 0,
        dia: diaVencimento, // ✅ Usar valor validado
        cor: cartao.cor || '#2196f3',
        icone: 'card-outline',
        foiPago: this.getStatusPago(id),
        dataPagamento: this.getDataPagamento(id),
      });
    });

    // Adiciona dívidas
    categorias.forEach((cat) => {
      if (!cat || !cat.id) return;

      if (cat.dividas && Array.isArray(cat.dividas) && cat.dividas.length > 0) {
        cat.dividas.forEach((divida: any, idx: number) => {
          if (!divida) return;

          // ✅ Validar diaPagamento
          const diaPagamento = parseInt(divida.diaPagamento);
          if (isNaN(diaPagamento) || diaPagamento < 1 || diaPagamento > 31) {
            console.warn(
              'Dia de pagamento inválido na dívida:',
              divida.nome,
              diaPagamento
            );
            return; // Pula esta dívida
          }

          const id = `divida-${cat.id}-${idx}`;
          compromissos.push({
            id,
            nome: divida.nome || 'Dívida sem nome',
            tipo: 'divida',
            valor: divida.valor || 0,
            dia: diaPagamento, // ✅ Usar valor validado
            cor: cat.cor || '#757575',
            icone: cat.icone || 'logo-usd',
            foiPago: this.getStatusPago(id),
            dataPagamento: this.getDataPagamento(id),
          });
        });
      }
    });

    // ✅ Resetar arrays antes de popular
    this.compromissosPorDia = {};
    this.compromissosPagosPorDia = {};
    this.compromissosAtrasados = [];

    // Separar por status
    compromissos.forEach((comp) => {
      // ✅ Validar o dia do compromisso antes de processar
      if (isNaN(comp.dia) || comp.dia < 1 || comp.dia > 31) {
        console.warn('Compromisso com dia inválido ignorado:', comp);
        return;
      }

      if (comp.foiPago) {
        if (!this.compromissosPagosPorDia[comp.dia]) {
          this.compromissosPagosPorDia[comp.dia] = [];
        }
        this.compromissosPagosPorDia[comp.dia].push(comp);
      } else if (comp.dia < hoje) {
        this.compromissosAtrasados.push(comp);
      } else {
        if (!this.compromissosPorDia[comp.dia]) {
          this.compromissosPorDia[comp.dia] = [];
        }
        this.compromissosPorDia[comp.dia].push(comp);
      }
    });

    // Ordenar arrays
    this.compromissosAtrasados.sort((a, b) => a.dia - b.dia);
    this.ordenarCompromissos();
  }

  // ✅ Adicione no método ordenarCompromissos para debug
  ordenarCompromissos() {
    console.log(
      '🔍 Debug - Compromissos por dia antes da ordenação:',
      this.compromissosPorDia
    );

    const ordenadoPendentes: { [dia: number]: Compromisso[] } = {};
    Object.keys(this.compromissosPorDia)
      .map((k) => {
        const num = parseInt(k, 10);
        if (isNaN(num)) {
          console.warn('⚠️ Chave inválida encontrada:', k);
          return null;
        }
        return num;
      })
      .filter((num) => num !== null) // Remove valores nulos
      .sort((a, b) => a! - b!)
      .forEach((dia) => {
        if (dia !== null) {
          ordenadoPendentes[dia] = this.compromissosPorDia[dia];
        }
      });

    this.compromissosPorDia = ordenadoPendentes;

    // Mesmo para compromissos pagos
    const ordenadoPagos: { [dia: number]: Compromisso[] } = {};
    Object.keys(this.compromissosPagosPorDia)
      .map((k) => {
        const num = parseInt(k, 10);
        if (isNaN(num)) {
          console.warn('⚠️ Chave inválida encontrada em pagos:', k);
          return null;
        }
        return num;
      })
      .filter((num) => num !== null)
      .sort((a, b) => a! - b!)
      .forEach((dia) => {
        if (dia !== null) {
          ordenadoPagos[dia] = this.compromissosPagosPorDia[dia];
        }
      });

    this.compromissosPagosPorDia = ordenadoPagos;

    console.log('✅ Debug - Compromissos ordenados:', this.compromissosPorDia);
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
    try {
      // ✅ Verificação segura com fallback
      const pendentes = this.compromissosPorDia || {};
      const atrasados = this.compromissosAtrasados || [];
      const pagos = this.compromissosPagosPorDia || {};

      const temPendentes = Object.values(pendentes).some(
        (arr) => Array.isArray(arr) && arr.length > 0
      );

      const temAtrasados = Array.isArray(atrasados) && atrasados.length > 0;

      const temPagos = Object.values(pagos).some(
        (arr) => Array.isArray(arr) && arr.length > 0
      );

      return temPendentes || temAtrasados || temPagos;
    } catch (error) {
      console.error('Erro ao verificar compromissos:', error);
      return false;
    }
  }

  irParaCarteira() {
    this.navCtrl.navigateForward(['/nav/carteira']);
  }

  async doRefresh(event: any) {
    this.carregandoDados = true;
    await this.carregarCompromissosAsync();
    this.carregandoDados = false;
    setTimeout(() => {
      event.target.complete();
    }, 300);
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

  get todasDividasPagas(): boolean {
    try {
      // ✅ Verifica se tem compromissos mas todos estão pagas
      const temPendentes = Object.values(this.compromissosPorDia || {}).some(
        (arr) => Array.isArray(arr) && arr.length > 0
      );

      const temAtrasados =
        Array.isArray(this.compromissosAtrasados) &&
        this.compromissosAtrasados.length > 0;

      const temPagos = Object.values(this.compromissosPagosPorDia || {}).some(
        (arr) => Array.isArray(arr) && arr.length > 0
      );

      // ✅ Todas as dívidas foram pagas se:
      // - Não há pendentes nem atrasados
      // - Mas há compromissos pagos
      return !temPendentes && !temAtrasados && temPagos;
    } catch (error) {
      console.error(
        'Erro ao verificar se todas as dívidas estão pagas:',
        error
      );
      return false;
    }
  }
}
