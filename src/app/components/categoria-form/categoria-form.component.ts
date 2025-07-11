import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FinanceiroService } from 'src/app/services/financeiro.service';
import { AuthService } from 'src/app/services/auth.service'; // Adicione este import

@Component({
  selector: 'app-categoria-form',
  templateUrl: './categoria-form.component.html',
  styleUrls: ['./categoria-form.component.scss'],
  standalone: false,
})
export class CategoriaFormComponent {
  @Input() categoria: any = null;
  @Input() cartao: any = null;
  @Input() modo: 'categoria' | 'cartao' = 'categoria';

  novaCategoria = {
    id: '',
    nome: '',
    cor: '#ffa600',
    icone: 'logo-usd',
    somarAoTotal: true, // novo campo
  };

  novoCartao = {
    id: '',
    nome: '',
    cor: '#2196f3',
    diaFechamento: null,
    diaVencimento: null,
    somarAoTotal: true, // novo campo
  };

  formTouched = false;

  coresDisponiveis = [
    '#2196f3',
    '#1565c0',
    '#4caf50',
    '#087f23',
    '#f44336',
    '#b71c1c',
    '#ff9800',
    '#e65100',
    '#9c27b0',
    '#4a148c',
    '#ffd600',
    '#ffb300',
    '#bdbdbd',
    '#424242',
    '#a1887f',
    '#4e342e',
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

  public salvando = false;

  constructor(
    private modalCtrl: ModalController,
    private financeiroService: FinanceiroService,
    private authService: AuthService // Adicione aqui
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

  async salvar() {
    if (this.salvando) return; // Evita duplo disparo
    this.salvando = true;
    this.formTouched = true;

    const uid = this.authService.usuarioAtual?.uid;
    if (this.modo === 'categoria') {
      if (!this.novaCategoria.nome.trim()) {
        this.salvando = false;
        return;
      }
      if (this.novaCategoria.id) {
        this.financeiroService.updateCategoria(this.novaCategoria);
      } else {
        this.financeiroService.addCategoria(this.novaCategoria);
      }
      if (uid) await this.financeiroService.salvarFirebase(uid);
      this.modalCtrl.dismiss(this.novaCategoria);
    } else {
      if (
        !this.novoCartao.nome.trim() ||
        !this.novoCartao.diaFechamento ||
        !this.novoCartao.diaVencimento
      ) {
        this.salvando = false;
        return;
      }
      if (this.novoCartao.id) {
        this.financeiroService.updateCartao(this.novoCartao);
      } else {
        this.financeiroService.addCartao(this.novoCartao);
      }
      if (uid) await this.financeiroService.salvarFirebase(uid);
      this.modalCtrl.dismiss(this.novoCartao);
    }
    this.salvando = false;
  }
}
