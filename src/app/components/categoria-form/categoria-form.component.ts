import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FinanceiroService } from 'src/app/services/financeiro.service';

@Component({
  selector: 'app-categoria-form',
  templateUrl: './categoria-form.component.html',
  styleUrls: ['./categoria-form.component.scss'],
  standalone: false,
})
export class CategoriaFormComponent {
  @Input() categoria: any = null;
  @Input() cartao: any = null;
  @Input() modo: 'categoria' | 'cartao' = 'categoria'; // NOVO

  novaCategoria = {
    id: '',
    nome: '',
    cor: '#ffa600',
    icone: 'logo-usd',
  };

  novoCartao = {
    id: '',
    nome: '',
    cor: '#2196f3',
    diaFechamento: null, // ou undefined
    diaVencimento: null, // ou undefined
  };

  coresDisponiveis = [
    '#2196f3',
    '#1565c0', // Azul
    '#4caf50',
    '#087f23', // Verde
    '#f44336',
    '#b71c1c', // Vermelho
    '#ff9800',
    '#e65100', // Laranja
    '#9c27b0',
    '#4a148c', // Roxo
    '#ffd600',
    '#ffb300', // Amarelo
    '#bdbdbd',
    '#424242', // Cinza
    '#a1887f',
    '#4e342e', // Marrom
  ];

  iconesDisponiveis = [
    'logo-usd',
    'cash-outline',
    'card-outline',
    'document-text-outline',
    'bar-chart-outline',
    'home-outline',
    'business-outline',
    'water-outline',
    'bulb-outline',
    'construct-outline',
    'car-outline',
    'bus-outline',
    'bicycle-outline',
    'airplane-outline',
    'game-controller-outline',
    'headset-outline',
    'library-outline',
    'musical-notes-outline',
    'wifi-outline',
    'briefcase-outline',
    'desktop-outline',
    'phone-portrait-outline',
    'people-outline',
    'reader-outline',
    'fitness-outline',
    'nutrition-outline',
    'body-outline',
    'flame-outline',
    'restaurant-outline',
    'fast-food-outline',
    'cart-outline',
    'school-outline',
    'color-palette-outline',
    'paw-outline',
    'gift-outline',
  ];

  constructor(
    private modalCtrl: ModalController,
    private financeiroService: FinanceiroService
  ) {}

  ngOnInit() {
    if (this.modo === 'categoria' && this.categoria) {
      this.novaCategoria = { ...this.categoria };
    }
    if (this.modo === 'cartao' && this.cartao) {
      this.novoCartao = { ...this.cartao };
    }
  }

  fechar() {
    this.modalCtrl.dismiss();
  }

  selecionarIcone(icon: string) {
    this.novaCategoria.icone = icon;
  }

  salvar() {
    if (this.modo === 'categoria') {
      if (!this.novaCategoria.nome.trim()) {
        alert('Informe o nome da categoria');
        return;
      }
      if (this.novaCategoria.id) {
        this.financeiroService.updateCategoria(this.novaCategoria);
      } else {
        this.financeiroService.addCategoria(this.novaCategoria);
      }
      this.modalCtrl.dismiss(this.novaCategoria);
    } else {
      if (!this.novoCartao.nome.trim()) {
        alert('Informe o nome do cartão');
        return;
      }
      // Aqui você pode chamar o método do service para adicionar cartão
      this.financeiroService.addCartao(this.novoCartao);
      this.modalCtrl.dismiss(this.novoCartao);
    }
  }
}
