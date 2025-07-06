import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-categoria-form',
  templateUrl: './categoria-form.component.html',
  styleUrls: ['./categoria-form.component.scss'],
  standalone: false,
})
export class CategoriaFormComponent {
  @Input() categoria: any = null;

  novaCategoria = {
    id: '',
    nome: '',
    cor: '#129623',
    icone: 'logo-usd',
  };

  iconesDisponiveis = [
    // 💳 Finanças / Dívidas
    'logo-usd',
    'cash-outline',
    'card-outline',
    'document-text-outline',
    'bar-chart-outline',

    // 🏠 Casa / Vida Doméstica
    'home-outline',
    'business-outline',
    'water-outline',
    'bulb-outline',
    'construct-outline',

    // 🚗 Transporte / Viagens
    'car-outline',
    'bus-outline',
    'bicycle-outline',
    'airplane-outline',

    // 🎮 Lazer / Entretenimento
    'game-controller-outline',
    'headset-outline',
    'library-outline',

    // 🎧 Música
    'musical-notes-outline',
    'wifi-outline',

    // 💼 Trabalho / Produtividade
    'briefcase-outline',
    'desktop-outline',
    'phone-portrait-outline',
    'people-outline',
    'reader-outline',

    // 🥗 Saúde / Bem-estar
    'fitness-outline',
    'nutrition-outline',
    'body-outline',
    'flame-outline',

    // 🛒 Compras / Alimentação
    'restaurant-outline',
    'fast-food-outline',
    'cart-outline',

    // 🌍 Outros
    'school-outline',
    'color-palette-outline',
    'paw-outline', // Pet
    'gift-outline', // Presentes
  ];

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    if (this.categoria) {
      this.novaCategoria = { ...this.categoria };
    }
  }

  fechar() {
    this.modalCtrl.dismiss();
  }

  selecionarIcone(icon: string) {
    this.novaCategoria.icone = icon;
  }

  salvar() {
    if (!this.novaCategoria.nome.trim()) {
      alert('Informe o nome da categoria');
      return;
    }

    this.modalCtrl.dismiss(this.novaCategoria);
  }
}
