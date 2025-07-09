import { Component } from '@angular/core';
import {
  ModalController,
  AlertController,
  NavController,
} from '@ionic/angular';
import { CategoriaFormComponent } from '../components/categoria-form/categoria-form.component';
import { FinanceiroService } from '../services/financeiro.service';

@Component({
  selector: 'app-carteira',
  templateUrl: './carteira.page.html',
  styleUrls: ['./carteira.page.scss'],
  standalone: false,
})
export class CarteiraPage {
  categorias: any[] = [];
  categoriaMenuAberto: string | null = null; // Controle do menu customizado

  constructor(
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public financeiroService: FinanceiroService,
    private navCtrl: NavController // <--- adicione aqui
  ) {
    this.carregarCategorias();
  }

  public get categoriasCartoes() {
    return this.financeiroService.getCartoes().map((cartao: any) => ({
      ...cartao,
      gradient: this.financeiroService.generateGradient(cartao.cor),
    }));
  }

  carregarCategorias() {
    this.categorias = this.financeiroService.getCategorias();
    this.ordenarCategoriasPorValor();
  }

  ordenarCategoriasPorValor() {
    this.categorias.sort((a, b) => parseFloat(b.valor) - parseFloat(a.valor));
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

    modal.onDidDismiss().then((retorno) => {
      if (retorno.data) {
        if (modo === 'categoria') {
          if (objetoParaEditar) {
            this.atualizarCategoria(retorno.data);
          } else {
            this.adicionarNovaCategoria(retorno.data);
          }
        }
        // Para cartões, você pode adicionar lógica semelhante aqui se desejar atualizar a lista de cartões na tela
      }
    });

    await modal.present();
  }

  adicionarNovaCategoria(novaCat: any) {
    novaCat.id = Date.now().toString();
    this.categorias.push(novaCat);
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

  excluirCategoria(id: string) {
    this.categorias = this.categorias.filter((cat) => cat.id !== id);
  }

  doRefresh(event: any) {
    this.carregarCategorias();
    setTimeout(() => {
      event.target.complete();
    }, 600); // tempo para simular carregamento, ajuste se quiser
  }

  // Métodos de navegação:
  irParaCartoes() {
    this.navCtrl.navigateForward(['/cartoes']);
  }

  irParaDividas(categoria: any) {
    this.navCtrl.navigateForward(['/dividas', categoria.id]);
  }
}
