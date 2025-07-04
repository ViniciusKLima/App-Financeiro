import { Component } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { CategoriaFormComponent } from '../components/categoria-form/categoria-form.component';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-carteira',
  templateUrl: './carteira.page.html',
  styleUrls: ['./carteira.page.scss'],
  standalone: false,
})
export class CarteiraPage {
  categorias = [
    {
      id: '1',
      nome: 'Boletos',
      icone: 'document-text-outline',
      cor: '#6F42C1',
    },
    {
      id: '2',
      nome: 'Cartões',
      icone: 'card-outline',
      cor: '#007BFF',
    },
  ];

  mostrarBotoesFlutuantes = false;
  modoEdicao = false;
  iconeFab = 'add'; // Estado inicial do FAB

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController
  ) {}

  // Lida com o clique no botão FAB
  acaoFab() {
    if (this.iconeFab === 'add') {
      this.mostrarBotoesFlutuantes = true;
      this.iconeFab = 'close-outline';
    } else if (this.iconeFab === 'close-outline') {
      this.mostrarBotoesFlutuantes = false;
      this.iconeFab = 'add';
    } else if (this.iconeFab === 'checkmark-outline') {
      this.finalizarEdicao();
    }
  }

  // Ação do botão "Nova Categoria"
  novaCategoria() {
    this.mostrarBotoesFlutuantes = false;
    this.iconeFab = 'add';
    this.abrirModalCategoriaIndividual();
  }

  // Ação do botão "Editar Categorias"
  editarCategorias() {
    this.mostrarBotoesFlutuantes = false;
    this.modoEdicao = true;
    this.iconeFab = 'checkmark-outline';
  }

  // Finaliza modo edição
  finalizarEdicao() {
    this.modoEdicao = false;
    this.iconeFab = 'add';
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
  }

  atualizarCategoria(catEditada: any) {
    const index = this.categorias.findIndex((c) => c.id === catEditada.id);
    if (index > -1) {
      this.categorias[index] = catEditada;
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