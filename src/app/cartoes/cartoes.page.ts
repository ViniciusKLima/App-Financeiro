import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FinanceiroService } from '../services/financeiro.service';
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
export class CartoesPage implements AfterViewInit {
  @ViewChild('scrollDiv', { static: false })
  scrollDiv!: ElementRef<HTMLDivElement>;

  cartoes: any[] = [];
  cartaoAtivoIndex = 0;
  scrollTimeout: any;
  cartaoMenuAberto: string | null = null;

  constructor(
    public financeiroService: FinanceiroService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) {
    this.cartoes = this.financeiroService.getCartoes().map((cartao: any) => ({
      ...cartao,
      gradient: this.financeiroService.generateGradient(cartao.cor),
    }));
  }

  ngAfterViewInit() {
    setTimeout(() => this.scrollToCenter(this.cartaoAtivoIndex), 100);
  }

  voltar() {
    this.navCtrl.navigateBack('/nav/carteira');
  }

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

    await modal.present();
  }

  // Abrir modal para adicionar cartão
  async novoCartao() {
    await this.abrirModalCartao('cartao');
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
        this.cartoes = this.financeiroService
          .getCartoes()
          .map((cartao: any) => ({
            ...cartao,
            gradient: this.financeiroService.generateGradient(cartao.cor),
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
    await this.abrirModalCartao('cartao', cartao);
  }

  // Excluir cartão (confirmação)
  async confirmarExclusao(id: string, event: Event) {
    event.stopPropagation();
    this.fecharMenus();

    const alert = await this.alertCtrl.create({
      header: 'Tem certeza?',
      message: 'Essa ação não pode ser desfeita.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Excluir', handler: () => this.excluirCartao(id) },
      ],
    });
    await alert.present();
  }

  // Excluir cartão da lista
  excluirCartao(id: string) {
    this.cartoes = this.cartoes.filter((cartao) => cartao.id !== id);
  }

  doRefresh(event: any) {
    // Atualize a lista de cartões
    this.cartoes = this.financeiroService.getCartoes().map((cartao: any) => ({
      ...cartao,
      gradient: this.financeiroService.generateGradient(cartao.cor),
    }));
    setTimeout(() => {
      event.target.complete();
    }, 600); // tempo para simular carregamento, ajuste se quiser
  }
}
