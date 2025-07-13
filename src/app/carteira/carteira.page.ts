import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  ModalController,
  AlertController,
  NavController,
} from '@ionic/angular';
import { CategoriaFormComponent } from '../components/categoria-form/categoria-form.component';
import { FinanceiroFacadeService } from '../services/financeiro-facade.service';

@Component({
  selector: 'app-carteira',
  templateUrl: './carteira.page.html',
  styleUrls: ['./carteira.page.scss'],
  standalone: false,
})
export class CarteiraPage implements OnInit, OnDestroy {
  categorias: any[] = [];
  categoriaMenuAberto: string | null = null;
  private dadosSubscription?: Subscription;

  // ✅ Estados de loading
  carregandoDados = true;
  primeiraVezCarregando = true;

  constructor(
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public financeiroFacade: FinanceiroFacadeService,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    this.carregandoDados = true;
    this.primeiraVezCarregando = true;

    // Carrega dados iniciais
    await this.carregarCategorias();

    // ✅ Finaliza o loading
    this.carregandoDados = false;
    this.primeiraVezCarregando = false;

    // ✅ Se inscreve para receber atualizações em tempo real
    this.dadosSubscription = this.financeiroFacade.dadosAtualizados$.subscribe(
      async (dados) => {
        console.log('📱 Carteira atualizada automaticamente');
        // ✅ Loading mais rápido para atualizações
        this.carregandoDados = true;
        await this.carregarCategorias();
        this.carregandoDados = false;
      }
    );
  }

  ngOnDestroy() {
    // Para a subscription quando sair da página
    if (this.dadosSubscription) {
      this.dadosSubscription.unsubscribe();
    }
  }

  public get categoriasCartoes() {
    return this.financeiroFacade.getCartoes().map((cartao: any) => ({
      ...cartao,
      gradient: this.financeiroFacade.generateGradient(cartao.cor),
    }));
  }

  async carregarCategorias() {
    const uid = localStorage.getItem('uid');
    if (uid) {
      this.categorias =
        await this.financeiroFacade.carregarCategoriasDoFirebase(uid);
      this.ordenarCategoriasPorValor();
    }
  }

  ordenarCategoriasPorValor() {
    this.categorias.sort((a, b) => {
      const valorA = this.financeiroFacade.getTotalDividasCategoria(a.id);
      const valorB = this.financeiroFacade.getTotalDividasCategoria(b.id);

      // Ordem decrescente: maior valor primeiro
      return valorB - valorA;
    });
  }

  // Ação do botão "Nova Categoria"
  novaCategoria() {
    this.abrirModalCategoriaOuCartao('categoria');
  }

  // Ação do botão "Novo Cartão"
  novoCartao() {
    this.abrirModalCategoriaOuCartao('cartao');
  }

  // Abre o modal para criar/editar categoria ou cartão
  async abrirModalCategoriaOuCartao(
    modo: 'categoria' | 'cartao',
    objetoParaEditar?: any
  ) {
    const componentProps: any = { modo };
    if (objetoParaEditar) {
      if (modo === 'categoria') componentProps.categoria = objetoParaEditar;
      if (modo === 'cartao') componentProps.cartao = objetoParaEditar;
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

    modal.onDidDismiss().then(async (retorno) => {
      if (retorno.data && retorno.data.salvo) {
        // ✅ NÃO salvar novamente - já foi salvo no modal
        console.log(`${retorno.data.acao} ${modo}:`, retorno.data);

        // ✅ Apenas recarrega para atualizar a UI (opcional, o listener já faz isso)
        // this.carregarCategorias(); // Comentado pois o listener já atualiza
      }
    });

    await modal.present();
  }

  adicionarNovaCategoria(novaCat: any) {
    this.carregarCategorias();
    this.ordenarCategoriasPorValor();
  }

  atualizarCategoria(catEditada: any) {
    const index = this.categorias.findIndex((c) => c.id === catEditada.id);
    if (index > -1) {
      this.categorias[index] = catEditada;
      this.ordenarCategoriasPorValor();
    }
  }

  // Abre o menu customizado da categoria
  abrirMenuCategoria(categoria: any, event: Event) {
    event.stopPropagation();
    this.categoriaMenuAberto = categoria.id;
  }

  // Fecha todos os menus ao clicar fora
  fecharMenus() {
    this.categoriaMenuAberto = null;
  }

  // Abre o modal de edição da categoria
  async abrirModalCategoria(categoria: any, event: any) {
    event.stopPropagation();
    this.fecharMenus();
    this.abrirModalCategoriaOuCartao('categoria', categoria);
  }

  // Exclusão com confirmação
  async confirmarExclusao(id: string, event: any) {
    event.stopPropagation();
    this.fecharMenus();

    const alert = await this.alertCtrl.create({
      header: 'Excluir categoria?',
      message: 'Todos os dados e dívidas desta categoria serão removidos.',
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.excluirCategoria(id);
          },
        },
      ],
    });

    await alert.present();
  }

  async excluirCategoria(id: string) {
    const uid = localStorage.getItem('uid');
    if (uid) {
      await this.financeiroFacade.excluirCategoria(uid, id);
      // A atualização será feita automaticamente pelo listener
    }
  }

  async doRefresh(event: any) {
    this.carregandoDados = true;
    await this.carregarCategorias();
    this.carregandoDados = false;
    setTimeout(() => {
      event.target.complete();
    }, 300);
  }

  // Métodos de navegação:
  irParaCartoes() {
    this.navCtrl.navigateForward(['/cartoes']);
  }

  irParaDividas(categoria: any) {
    this.navCtrl.navigateForward(['/dividas', categoria.id]);
  }
}
