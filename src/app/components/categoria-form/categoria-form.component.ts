import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FinanceiroFacadeService } from '../../services/financeiro-facade.service';
import { AuthService } from '../../services/core/auth.service';

interface NovoCartao {
  id: string;
  nome: string;
  cor: string;
  diaFechamento: number | null;
  diaVencimento: number | null;
  somarAoTotal: boolean;
}

@Component({
  selector: 'app-categoria-form',
  templateUrl: './categoria-form.component.html',
  styleUrls: ['./categoria-form.component.scss'],
  standalone: false,
})
export class CategoriaFormComponent implements OnInit {
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

  novoCartao: NovoCartao = {
    id: '',
    nome: '',
    cor: '#2196f3',
    diaFechamento: null,
    diaVencimento: null,
    somarAoTotal: true,
  };

  formTouched = false;

  coresDisponiveis = [
    '#2196f3', // 1. Azul padrão - versátil
    '#1565c0', // 2. Azul escuro - profissional
    '#4caf50', // 3. Verde - positivo/dinheiro
    '#2e7d32', // 4. Verde escuro - natureza/saúde
    '#f44336', // 5. Vermelho - urgente/importante
    '#d32f2f', // 6. Vermelho escuro - alertas
    '#ff9800', // 7. Laranja - energia/criatividade
    '#ef6c00', // 8. Laranja escuro - trabalho/produtividade
    '#9c27b0', // 9. Roxo - luxo/premium
    '#7b1fa2', // 10. Roxo escuro - místico/especial
    '#e91e63', // 11. Rosa - amor/relacionamentos
    '#00acc1', // 12. Ciano - tecnologia/digital
    '#607d8b', // 13. Azul acinzentado - elegante/sóbrio
    '#8d6e63', // 14. Marrom - casa/estabilidade
    '#5d4037', // 15. Marrom escuro - tradição/confiança
    '#424242', // 16. Cinza escuro - neutro/minimalista
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
    private financeiroFacade: FinanceiroFacadeService,
    private authService: AuthService
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

  validarDiaFechamento(event: any) {
    const valor = parseInt(event.target.value);
    if (isNaN(valor) || valor < 1) {
      event.target.value = '1';
      this.novoCartao.diaFechamento = 1;
    } else if (valor > 31) {
      event.target.value = '31';
      this.novoCartao.diaFechamento = 31;
    } else {
      this.novoCartao.diaFechamento = valor;
    }
  }

  validarDiaVencimento(event: any) {
    const valor = parseInt(event.target.value);
    if (isNaN(valor) || valor < 1) {
      event.target.value = '1';
      this.novoCartao.diaVencimento = 1;
    } else if (valor > 31) {
      event.target.value = '31';
      this.novoCartao.diaVencimento = 31;
    } else {
      this.novoCartao.diaVencimento = valor;
    }
  }

  async salvar() {
    if (this.salvando) return;
    this.salvando = true;
    this.formTouched = true;

    const uid = localStorage.getItem('uid') || undefined;

    if (this.modo === 'categoria') {
      if (!this.novaCategoria.nome.trim()) {
        this.salvando = false;
        return;
      }

      if (this.novaCategoria.id) {
        await this.financeiroFacade.updateCategoria(this.novaCategoria, uid);
      } else {
        await this.financeiroFacade.addCategoria(this.novaCategoria, uid);
      }

      this.modalCtrl.dismiss({
        salvo: true,
        categoria: this.novaCategoria,
        acao: this.novaCategoria.id ? 'editou' : 'criou',
      });
    } else {
      // ✅ Validação com verificação de tipo
      const fechamento = this.novoCartao.diaFechamento;
      const vencimento = this.novoCartao.diaVencimento;

      if (
        !this.novoCartao.nome.trim() ||
        fechamento === null ||
        vencimento === null ||
        fechamento < 1 ||
        fechamento > 31 ||
        vencimento < 1 ||
        vencimento > 31
      ) {
        this.salvando = false;
        return;
      }

      if (this.novoCartao.id) {
        await this.financeiroFacade.updateCartao(this.novoCartao, uid);
      } else {
        await this.financeiroFacade.addCartao(this.novoCartao, uid);
      }

      this.modalCtrl.dismiss({
        salvo: true,
        cartao: this.novoCartao,
        acao: this.novoCartao.id ? 'editou' : 'criou',
      });
    }
    this.salvando = false;
  }
}
