import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FinanceiroFacadeService } from '../services/financeiro-facade.service';
import {
  ModalController,
  AlertController,
  ActionSheetController,
} from '@ionic/angular';
import { DividaFormComponent } from '../components/divida-form/divida-form.component';
import { CategoriaFormComponent } from '../components/categoria-form/categoria-form.component';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-cartoes',
  templateUrl: './cartoes.page.html',
  styleUrls: ['./cartoes.page.scss'],
  standalone: false,
})
export class CartoesPage implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('scrollDiv', { static: false })
  scrollDiv!: ElementRef<HTMLDivElement>;

  cartoes: any[] = [];
  cartaoAtivoIndex = 0;
  scrollTimeout: any;
  cartaoMenuAberto: string | null = null;
  private dadosSubscription?: Subscription;

  // ✅ Estados de loading
  carregandoDados = true;
  primeiraVezCarregando = true;

  constructor(
    public financeiroFacade: FinanceiroFacadeService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController
  ) {}

  async ngOnInit() {
    this.carregandoDados = true;
    this.primeiraVezCarregando = true;

    try {
      // ✅ Carrega dados iniciais
      const uid = localStorage.getItem('uid');
      if (uid) {
        await this.financeiroFacade.carregarFirebase(uid);
        this.atualizarCartoes();
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    } finally {
      // ✅ Finaliza o loading
      this.carregandoDados = false;
      this.primeiraVezCarregando = false;
    }

    // ✅ Se inscreve para receber atualizações em tempo real
    this.dadosSubscription = this.financeiroFacade.dadosAtualizados$.subscribe(
      (dados) => {
        console.log('📱 Cartões atualizados automaticamente');
        this.atualizarCartoes();
      }
    );
  }

  ngOnDestroy() {
    if (this.dadosSubscription) {
      this.dadosSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    // ✅ Só executa após o loading inicial
    setTimeout(() => {
      if (!this.carregandoDados || !this.primeiraVezCarregando) {
        this.scrollToCenter(this.cartaoAtivoIndex);
      }
    }, 100);
  }

  voltar() {
    this.navCtrl.navigateBack('/nav/carteira');
  }

  // Corrigir o método openAdicionarCompra
  async openAdicionarCompra() {
    const modal = await this.modalCtrl.create({
      component: DividaFormComponent,
      componentProps: {
        modo: 'cartao',
        cartaoId: this.cartaoAtivo?.id,
      },
      breakpoints: [0, 0.8, 0.9],
      initialBreakpoint: 0.9,
      showBackdrop: true,
      backdropDismiss: true,
    });

    modal.onDidDismiss().then(async (retorno) => {
      if (retorno.data?.salvo) {
        // ✅ SÓ processa se realmente salvou
        console.log('✅ Compra salva com sucesso:', retorno.data);

        // ✅ Atualiza a lista local sem duplicar
        this.atualizarCartoes();
      }
    });

    await modal.present();
  }

  // Abrir modal para adicionar cartão
  async novoCartao() {
    const modal = await this.modalCtrl.create({
      component: CategoriaFormComponent,
      componentProps: { modo: 'cartao' },
      initialBreakpoint: 0.9,
      breakpoints: [0, 0.8, 0.9],
      backdropDismiss: true,
      mode: 'ios',
      cssClass: 'custom-modal-bottom-sheet',
    });

    modal.onDidDismiss().then(async (retorno) => {
      if (retorno.data) {
        // ✅ Pega o uid e salva no Firebase
        const uid = localStorage.getItem('uid');
        if (uid) {
          await this.financeiroFacade.addCartao(retorno.data, uid);
        }

        // Atualiza a lista local
        const novosCartoes = this.financeiroFacade
          .getCartoes()
          .map((cartao: any) => ({
            ...cartao,
            gradient: this.financeiroFacade.generateGradient(cartao.cor),
          }));
        this.cartoes = this.ordenarCartoesPorVencimento(novosCartoes);

        // Define o novo cartão como ativo
        if (retorno.data.id) {
          const novoIndex = this.cartoes.findIndex(
            (c) => c.id === retorno.data.id
          );
          if (novoIndex !== -1) {
            this.cartaoAtivoIndex = novoIndex;
            setTimeout(() => this.scrollToCenter(novoIndex), 100);
          }
        }
      }
    });

    await modal.present();
  }

  // Método genérico para abrir o modal de cartão
  async abrirModalCartao(modo: 'cartao', cartaoParaEditar?: any) {
    const componentProps: any = { modo };
    if (cartaoParaEditar) {
      componentProps.cartao = cartaoParaEditar;
    }

    const modal = await this.modalCtrl.create({
      component: CategoriaFormComponent,
      componentProps,
      initialBreakpoint: 0.9,
      breakpoints: [0, 0.8, 0.9],
      backdropDismiss: true,
      mode: 'ios',
      cssClass: 'custom-modal-bottom-sheet',
    });

    modal.onDidDismiss().then((retorno) => {
      if (retorno.data) {
        // Atualize sua lista de cartões aqui, se necessário
        this.cartoes = this.financeiroFacade
          .getCartoes()
          .map((cartao: any) => ({
            ...cartao,
            gradient: this.financeiroFacade.generateGradient(cartao.cor),
          }));
      }
    });

    await modal.present();
  }

  get cartaoAtivo() {
    return this.cartoes[this.cartaoAtivoIndex];
  }

  onScroll(event: any) {
    // Debounce para detectar fim do scroll
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.snapToClosest();
    }, 120); // Ajuste o tempo para mais ou menos sensível
  }

  snapToClosest() {
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

    this.cartaoAtivoIndex = closest;
    this.scrollToCenter(closest);
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
    this.cartaoMenuAberto = cartao.id;
  }

  fecharMenus() {
    this.cartaoMenuAberto = null;
  }

  // Editar cartão (abre modal)
  async editarCartao(cartao: any, event: Event) {
    event.stopPropagation();
    this.fecharMenus();

    const modal = await this.modalCtrl.create({
      component: CategoriaFormComponent,
      componentProps: { modo: 'cartao', cartao },
      initialBreakpoint: 0.9,
      breakpoints: [0, 0.8, 0.9],
      backdropDismiss: true,
      mode: 'ios',
      cssClass: 'custom-modal-bottom-sheet',
    });

    modal.onDidDismiss().then(async (retorno) => {
      if (retorno.data) {
        // ✅ Pega o uid e salva no Firebase
        const uid = localStorage.getItem('uid');
        if (uid) {
          await this.financeiroFacade.updateCartao(retorno.data, uid);
        }

        // Atualiza a lista local
        this.cartoes = this.financeiroFacade
          .getCartoes()
          .map((cartao: any) => ({
            ...cartao,
            gradient: this.financeiroFacade.generateGradient(cartao.cor),
          }));
      }
    });

    await modal.present();
  }

  // Excluir cartão (confirmação)
  async confirmarExclusao(id: string, event: Event) {
    event.stopPropagation();
    this.fecharMenus();

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Excluir cartão?',
      subHeader: 'Você perderá todos os dados e compras salvos neste cartão.',
      buttons: [
        {
          text: 'Excluir',
          role: 'destructive',
          icon: 'trash-outline',
          handler: () => this.excluirCartao(id),
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          icon: 'close-outline',
        },
      ],
    });
    await actionSheet.present();
  }

  // Excluir cartão da lista
  excluirCartao(id: string) {
    const uid = localStorage.getItem('uid') ?? undefined;
    this.financeiroFacade.removerCartao(id, uid);
    this.cartoes = this.cartoes.filter((cartao) => cartao.id !== id);

    // Ajusta o cartão ativo se necessário
    if (this.cartaoAtivoIndex >= this.cartoes.length) {
      this.cartaoAtivoIndex = Math.max(0, this.cartoes.length - 1);
    }
  }

  async doRefresh(event: any) {
    this.carregandoDados = true;

    try {
      // ✅ Aguarda o carregamento dos dados do Firebase
      const uid = localStorage.getItem('uid');
      if (uid) {
        await this.financeiroFacade.carregarFirebase(uid);
      }

      // ✅ Atualiza a lista local
      this.atualizarCartoes();
    } catch (error) {
      console.error('Erro ao recarregar cartões:', error);
    } finally {
      this.carregandoDados = false;

      // ✅ Completa o refresh
      setTimeout(() => {
        event.target.complete();
      }, 100);
    }
  }

  async editarCompra(compra: any, index: number) {
    const modal = await this.modalCtrl.create({
      component: DividaFormComponent,
      componentProps: {
        modo: 'cartao',
        cartaoId: this.cartaoAtivo?.id,
        compra: { ...compra },
        compraIndex: index,
      },
      breakpoints: [0, 0.8, 0.9],
      initialBreakpoint: 0.9,
      showBackdrop: true,
      backdropDismiss: true,
    });

    modal.onDidDismiss().then((retorno) => {
      if (retorno.data && retorno.data.compraEditada) {
        this.cartaoAtivo.compras[index] = retorno.data.compraEditada;
        this.cartoes = this.financeiroFacade
          .getCartoes()
          .map((cartao: any) => ({
            ...cartao,
            gradient: this.financeiroFacade.generateGradient(cartao.cor),
          }));
      }
    });

    await modal.present();
  }

  // ✅ Substitua o alert de atualizar fatura
  async confirmarAtualizarFatura() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Atualizar fatura?',
      subHeader:
        'As compras parceladas avançam para a próxima parcela. Compras quitadas serão removidas.',
      buttons: [
        {
          text: 'Atualizar',
          role: 'destructive',
          icon: 'refresh-outline',
          handler: () => this.atualizarFaturaCartao(),
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          icon: 'close-outline',
        },
      ],
    });
    await actionSheet.present();
  }

  async atualizarFaturaCartao() {
    const cartao = this.cartaoAtivo;
    if (!cartao || !cartao.compras) return;

    cartao.compras = cartao.compras.filter((compra: any) => {
      if (compra.compraFixa) {
        return true;
      }
      if (compra.parcelaAtual < compra.totalParcelas) {
        compra.parcelaAtual += 1;
        return true;
      }
      return false;
    });

    // Salva o mês/ano da última atualização
    const agora = new Date();
    cartao.ultimaFaturaAtualizada = `${agora.getFullYear()}-${String(
      agora.getMonth() + 1
    ).padStart(2, '0')}`;

    cartao.faturaAtualizada = true;

    // ✅ Salva no Firebase
    const uid = localStorage.getItem('uid');
    if (uid) {
      await this.financeiroFacade.updateCartao(cartao, uid);
    }

    const novosCartoes = this.financeiroFacade.getCartoes().map((c: any) => ({
      ...c,
      gradient: this.financeiroFacade.generateGradient(c.cor),
    }));
    this.cartoes = this.ordenarCartoesPorVencimento(novosCartoes);

    const novoIndex = this.cartoes.findIndex((c) => c.id === cartao.id);
    this.cartaoAtivoIndex = novoIndex !== -1 ? novoIndex : 0;
  }

  private atualizarCartoes() {
    try {
      const cartoesData = this.financeiroFacade.getCartoes();
      if (cartoesData && Array.isArray(cartoesData)) {
        this.cartoes = this.ordenarCartoesPorVencimento(
          cartoesData.map((cartao: any) => ({
            ...cartao,
            gradient: this.financeiroFacade.generateGradient(cartao.cor),
          }))
        );
      } else {
        this.cartoes = [];
      }
    } catch (error) {
      console.error('Erro ao atualizar cartões:', error);
      this.cartoes = [];
    }
  }

  private ordenarCartoesPorVencimento(cartoes: any[]): any[] {
    const hoje = new Date();
    const diaHoje = hoje.getDate();

    // Calcula quantos dias faltam para o vencimento de cada cartão
    return cartoes
      .map((cartao) => {
        let diasParaVencer = cartao.diaVencimento - diaHoje;
        if (diasParaVencer < 0) diasParaVencer += 31; // Considera mês de 31 dias para simplificar
        return { ...cartao, _diasParaVencer: diasParaVencer };
      })
      .sort((a, b) => a._diasParaVencer - b._diasParaVencer)
      .map((cartao) => {
        delete cartao._diasParaVencer;
        return cartao;
      });
  }

  mostrarAtualizarFatura(cartao: any): boolean {
    if (!cartao || !cartao.diaVencimento) return false;
    const hoje = new Date();
    const diaHoje = hoje.getDate();

    // Mês/ano atual
    const cicloAtual = `${hoje.getFullYear()}-${String(
      hoje.getMonth() + 1
    ).padStart(2, '0')}`;

    // Se passou do vencimento e ainda não atualizou neste ciclo,
    // só altera para false se houver compras
    if (
      diaHoje > cartao.diaVencimento &&
      cartao.ultimaFaturaAtualizada !== cicloAtual &&
      cartao.compras &&
      cartao.compras.length > 0 &&
      cartao.faturaAtualizada !== false
    ) {
      cartao.faturaAtualizada = false;
      this.financeiroFacade.updateCartao(cartao);
    }

    // Só mostra se faturaAtualizada for false e houver compras
    return (
      cartao.compras &&
      cartao.compras.length > 0 &&
      cartao.faturaAtualizada === false
    );
  }

  // ✅ Método para formatar texto das parcelas
  getParcelasTexto(compra: any): string {
    if (!compra) return 'À vista';

    if (compra.compraFixa) {
      return 'Fixa';
    }

    if (
      compra.parcelaAtual &&
      compra.totalParcelas &&
      compra.parcelaAtual > 0 &&
      compra.totalParcelas > 0
    ) {
      return `${compra.parcelaAtual} de ${compra.totalParcelas}`;
    }

    return 'À vista';
  }
}
