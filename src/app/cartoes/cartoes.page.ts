import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FinanceiroFacadeService } from '../services/financeiro-facade.service'; // ✅ Novo
import { ModalController, AlertController } from '@ionic/angular';
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

  constructor(
    public financeiroFacade: FinanceiroFacadeService, // ✅ Troca aqui
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) {
    this.cartoes = this.ordenarCartoesPorVencimento(
      this.financeiroFacade.getCartoes().map((cartao: any) => ({
        ...cartao,
        gradient: this.financeiroFacade.generateGradient(cartao.cor),
      }))
    );
  }

  async ngOnInit() {
    const uid = localStorage.getItem('uid');
    if (uid) {
      await this.financeiroFacade.carregarFirebase(uid);
      this.atualizarCartoes();
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
    // Para a subscription quando sair da página
    if (this.dadosSubscription) {
      this.dadosSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.scrollToCenter(this.cartaoAtivoIndex), 100);
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
      if (retorno.data) {
        // ✅ Pega o uid e salva no Firebase
        const uid = localStorage.getItem('uid');
        if (uid) {
          await this.financeiroFacade.adicionarCompraCartao(
            this.cartaoAtivo?.id,
            retorno.data,
            uid
          );
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

    const alert = await this.alertCtrl.create({
      header: 'Excluir cartão?',
      message: 'Você perderá todos os dados e compras salvos neste cartão.',
      cssClass: 'custom-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => this.excluirCartao(id),
        },
      ],
    });
    await alert.present();
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

  doRefresh(event: any) {
    // Atualize a lista de cartões
    this.cartoes = this.financeiroFacade.getCartoes().map((cartao: any) => ({
      ...cartao,
      gradient: this.financeiroFacade.generateGradient(cartao.cor),
    }));
    setTimeout(() => {
      event.target.complete();
    }, 600); // tempo para simular carregamento, ajuste se quiser
  }

  async editarCompra(compra: any, index: number) {
    const modal = await this.modalCtrl.create({
      component: DividaFormComponent,
      componentProps: {
        modo: 'cartao',
        cartaoId: this.cartaoAtivo?.id,
        compra: { ...compra }, // passa uma cópia da compra
        compraIndex: index,
      },
      breakpoints: [0, 0.8, 0.9],
      initialBreakpoint: 0.9,
      showBackdrop: true,
      backdropDismiss: true,
    });

    modal.onDidDismiss().then((retorno) => {
      if (retorno.data && retorno.data.compraEditada) {
        // Atualiza a compra editada no array do cartão ativo
        this.cartaoAtivo.compras[index] = retorno.data.compraEditada;
        // Atualize a lista de cartões se necessário
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

  async confirmarAtualizarFatura() {
    const alert = await this.alertCtrl.create({
      header: 'Atualizar fatura?',
      message: `Ao atualizar, as compras parceladas avançam para a próxima parcela. Compras já quitadas serão removidas. Compras fixas permanecem.<br><br>Deseja continuar?`,
      cssClass: 'custom-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Atualizar',
          handler: () => this.atualizarFaturaCartao(),
          role: 'destructive',
        },
      ],
    });
    await alert.present();
  }

  // Corrigir o método atualizarFaturaCartao
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
    this.cartoes = this.ordenarCartoesPorVencimento(
      this.financeiroFacade.getCartoes().map((cartao: any) => ({
        ...cartao,
        gradient: this.financeiroFacade.generateGradient(cartao.cor),
      }))
    );
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
}
