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
      valor: '1532.20',
      quantDividas: 5,
      icone: 'document-text-outline',
      cor: '#666',
    },
    {
      id: '2',
      nome: 'Trabalho',
      valor: '6244.00',
      quantDividas: 4,
      icone: 'card-outline',
      cor: '#007BFF',
    },
    {
      id: '3',
      nome: 'Casa',
      valor: '2065.38',
      quantDividas: 6,
      icone: 'home-outline',
      cor: '#08a708',
    },
    {
      id: '4',
      nome: 'Carro',
      valor: '3231.60',
      quantDividas: 3,
      icone: 'car-outline',
      cor: '#ffa600',
    },
    {
      id: '5',
      nome: 'Lazer',
      valor: '205.76',
      quantDividas: 2,
      icone: 'football-outline',
      cor: '#6F42C1',
    },
  ];

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController
  ) {
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
    this.ordenarCategoriasPorValor(); // <- aqui
  }

  atualizarCategoria(catEditada: any) {
    const index = this.categorias.findIndex((c) => c.id === catEditada.id);
    if (index > -1) {
      this.categorias[index] = catEditada;
      this.ordenarCategoriasPorValor(); // <- aqui
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
