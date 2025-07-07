import { Component } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { CategoriaFormComponent } from '../components/categoria-form/categoria-form.component';
import { AlertController } from '@ionic/angular';
import { FinanceiroService } from '../services/financeiro.service';

@Component({
  selector: 'app-carteira',
  templateUrl: './carteira.page.html',
  styleUrls: ['./carteira.page.scss'],
  standalone: false,
})
export class CarteiraPage {
  categorias: any[] = [];

  constructor(
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public popoverCtrl: PopoverController,
    public financeiroService: FinanceiroService // <-- troque de private para public
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
    this.abrirModalCategoriaIndividual();
  }

  // Abre o modal para criar/editar categoria
  async abrirModalCategoriaIndividual(categoria?: any) {
    const modal = await this.modalCtrl.create({
      component: CategoriaFormComponent,
      componentProps: { categoria },
      initialBreakpoint: 0.9,
      breakpoints: [0, 0.35, 0.6, 0.9],
      backdropDismiss: true,
      mode: 'ios',
      cssClass: 'custom-modal-bottom-sheet',
    });

    modal.onDidDismiss().then((retorno) => {
      if (retorno.data) {
        if (categoria) {
          this.atualizarCategoria(retorno.data);
        } else {
          this.adicionarNovaCategoria(retorno.data);
        }
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

  // Abre o modal de edição da categoria
  async abrirModalCategoria(categoria: any, event: any) {
    const popover = await this.popoverCtrl.getTop();
    if (popover) await popover.dismiss();

    this.abrirModalCategoriaIndividual(categoria);
  }

  // Exclusão com confirmação
  async confirmarExclusao(id: string, event: any) {
    const popover = await this.popoverCtrl.getTop();
    if (popover) await popover.dismiss();

    const alert = await this.alertCtrl.create({
      header: 'Tem certeza?',
      message:
        'Essa ação não pode ser desfeita e você perderá todas as dívidas associadas a esta categoria.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Excluir',
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
}
