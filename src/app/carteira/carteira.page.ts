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
      nome: 'Escritório',
      icone: 'card-outline',
      cor: '#007BFF',
    },
    {
      id: '3',
      nome: 'Casa',
      icone: 'home-outline',
      cor: '#007BFF',
    },
    {
      id: '4',
      nome: 'Lazer',
      icone: 'football-outline',
      cor: '#007BFF',
    },
    
  ];

  mostrarBotoesFlutuantes = false;
  modoEdicao = false;
  iconeFab = 'add'; // Controla o ícone do botão FAB

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController
  ) {}

  // Mostrar ou esconder os balões + controlar o ícone
  toggleBotoesFlutuantes() {
    this.mostrarBotoesFlutuantes = !this.mostrarBotoesFlutuantes;

    if (!this.mostrarBotoesFlutuantes && this.modoEdicao) {
      this.finalizarEdicao(); // Volta ao estado inicial
    }
  }

  // Ação do botão "Nova Categoria"
  novaCategoria() {
    this.toggleBotoesFlutuantes();
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
      initialBreakpoint: 0.35,
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
    const popover = await this.popoverCtrl.getTop(); // Pega o popover aberto
    if (popover) {
      await popover.dismiss(); // Fecha o popover
    }

    this.abrirModalCategoriaIndividual(categoria);
  }

  // Exclusão com confirmação
  async confirmarExclusao(id: string, event: any) {
    const popover = await this.popoverCtrl.getTop(); // Pega o popover aberto
    if (popover) {
      await popover.dismiss(); // Fecha o popover
    }

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