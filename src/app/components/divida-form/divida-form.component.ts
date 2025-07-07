import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FinanceiroService } from '../../services/financeiro.service';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-divida-form',
  templateUrl: './divida-form.component.html',
  styleUrls: ['./divida-form.component.scss'],
  standalone: false,
})
export class DividaFormComponent implements OnInit {
  cartoes: any[] = [];
  categorias: any[] = [];

  formCompra!: FormGroup;
  modo: 'cartao' | 'categoria' = 'cartao'; // controla qual formulário exibe

  mostrandoCartoes = false;
  mostrandoCategorias = false;

  constructor(
    private financeiroService: FinanceiroService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.cartoes = this.financeiroService.getCartoes();
    this.categorias = this.financeiroService.getCategorias();

    this.formCompra = this.fb.group({
      cartaoId: [''],
      nomeCompra: [''],
      valor: [''], // Começa como string vazio pra formatar corretamente
      compraFixa: [false],
      parcelaAtual: [1],
      totalParcelas: [1],
      descricao: [''],
      categoriaId: [''],
      nomeDivida: [''],
      valorDivida: [''], // Alterado pra começar como string vazio
      descricaoDivida: [''],
    });

    // Garantir que o input comece com R$ 0,00
    const inputElement = document.querySelector('.input-valor') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = this.formatarValor(0);
    }
  }

  get cartaoSelecionado() {
    const id = this.formCompra.get('cartaoId')?.value;
    return this.cartoes.find((c) => c.id === id);
  }

  get categoriaSelecionada() {
    const id = this.formCompra.get('categoriaId')?.value;
    return this.categorias.find((c) => c.id === id);
  }

  // Abre/fecha o select personalizado
  toggleSelect(tipo: 'cartoes' | 'categorias') {
    if (tipo === 'cartoes') {
      this.mostrandoCartoes = !this.mostrandoCartoes;
      this.mostrandoCategorias = false;
    } else {
      this.mostrandoCategorias = !this.mostrandoCategorias;
      this.mostrandoCartoes = false;
    }
  }

  // Seleciona cartão e atualiza o form
  selecionarCartao(cartao: any) {
    this.formCompra.get('cartaoId')?.setValue(cartao.id);
    this.mostrandoCartoes = false;

    // Atualiza o input com o valor formatado
    const input = document.querySelector('.input-valor') as HTMLInputElement;
    const valorAtual = this.formCompra.get('valor')?.value || 0;
    if (input) {
      input.value = this.formatarValor(valorAtual);
    }
  }

  // Seleciona categoria e atualiza o form
  selecionarCategoria(categoria: any) {
    this.formCompra.get('categoriaId')?.setValue(categoria.id);
    this.mostrandoCategorias = false;
  }

  onToggleFixa() {
    const parcelaAtual = this.formCompra.get('parcelaAtual');
    const totalParcelas = this.formCompra.get('totalParcelas');
    const isFixa = this.formCompra.value.compraFixa;

    if (isFixa) {
      parcelaAtual?.disable({ emitEvent: false });
      totalParcelas?.disable({ emitEvent: false });
    } else {
      parcelaAtual?.enable({ emitEvent: false });
      totalParcelas?.enable({ emitEvent: false });
    }
  }

  // Formata o valor para exibição visual
  formatarValor(valor: number | string): string {
    let numeroLimpo: number;

    if (typeof valor === 'string') {
      numeroLimpo = parseFloat(valor.replace(/[^0-9]/g, '') || '0');
    } else {
      numeroLimpo = Number(valor);
    }

    const numeroFormatado = (numeroLimpo / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });

    return numeroFormatado;
  }

  // Atualiza o valor no formulário com base na entrada do usuário
  onInputValor(event: Event) {
    const input = event.target as HTMLInputElement;
    let valorBruto = input.value.replace(/[^\d]/g, '');

    // Se for vazio, volta pro padrão
    if (!valorBruto || valorBruto === '') {
      this.formCompra.get('valor')?.setValue(0);
      input.value = this.formatarValor(0);
      return;
    }

    // Preenche com zero à direita se for menor que 3 dígitos
    if (valorBruto.length < 3) {
      valorBruto = valorBruto.padEnd(3, '0'); // Ex: '2' → '200' = R$ 2 centavos = 0,02
    }

    // Limita a 12 dígitos (ex: 999.999.999,99)
    valorBruto = valorBruto.slice(0, 12);

    const numeroCentavos = parseInt(valorBruto, 10);
    const valorReal = numeroCentavos / 100;

    // Atualiza o form com número real
    this.formCompra.get('valor')?.setValue(valorReal);

    // Atualiza o input com o valor formatado
    input.value = this.formatarValor(valorReal);
  }

  salvar() {
    if (this.modo === 'cartao') {
      const novaCompra = this.formCompra.value;
      const cartao = this.financeiroService.getCartaoById(novaCompra.cartaoId);

      if (cartao) {
        cartao.compras.push({
          nome: novaCompra.nomeCompra,
          valor: novaCompra.valor,
          parcelaAtual: novaCompra.parcelaAtual,
          totalParcelas: novaCompra.totalParcelas,
          descricao: novaCompra.descricao,
        });

        console.log('Compra adicionada ao cartão:', cartao);
      }
    } else {
      const novaDivida = {
        nome: this.formCompra.value.nomeDivida,
        diaPagamento: 1,
        valor: this.formCompra.value.valorDivida,
        descricao: this.formCompra.value.descricaoDivida,
      };

      const categoria = this.financeiroService.getCategoriaById(this.formCompra.value.categoriaId);

      if (categoria) {
        categoria.dividas.push(novaDivida);
        console.log('Dívida adicionada à categoria:', categoria);
      }
    }
  }
}