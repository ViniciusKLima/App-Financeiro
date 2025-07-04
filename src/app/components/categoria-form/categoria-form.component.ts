import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-categoria-form',
  templateUrl: './categoria-form.component.html',
  styleUrls: ['./categoria-form.component.scss'],
  standalone: false // Definido como false para ser usado em um módulo Angular
})
export class CategoriaFormComponent {
  @Input() categoria: any = null;

  novaCategoria = {
    id: '',
    nome: '',
    cor: '#000000',
    icone: 'card-outline'
  };

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    if (this.categoria) {
      this.novaCategoria = { ...this.categoria };
    }
  }

  fechar() {
    this.modalCtrl.dismiss();
  }

  salvar() {
    if (!this.novaCategoria.nome.trim()) {
      alert('Informe o nome da categoria');
      return;
    }

    this.modalCtrl.dismiss(this.novaCategoria);
  }
}