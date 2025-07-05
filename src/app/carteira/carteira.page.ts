import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CategoriaFormComponent } from '../categoria-form/categoria-form.component';

@Component({
  selector: 'app-carteira',
  templateUrl: './carteira.page.html',
  styleUrls: ['./carteira.page.scss'],
  standalone: false,
})
export class CarteiraPage {
  fabAberto = false;

  categorias = [
    { id: '1', nome: 'Boletos', icone: 'document-text-outline', cor: '#6F42C1' },
    { id: '2', nome: 'Cartões', icone: 'card-outline', cor: '#007BFF' },
  ];

  constructor(private modalCtrl: ModalController) {}

  alternarFab() {
    this.fabAberto = !this.fabAberto;
  }

  async abrirModalCategoria(categoria?: any) {
    const modal = await this.modalCtrl.create({
      component: CategoriaFormComponent,
      componentProps: { categoria },
      cssClass: 'modal-flutuante-central', // define o estilo da janelinha flutuante
      backdropDismiss: true, // permite fechar clicando fora
      showBackdrop: true,
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
    this.fabAberto = false;
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

  excluirCategoria(id: string) {
    this.categorias = this.categorias.filter((cat) => cat.id !== id);
  }
}
