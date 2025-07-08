import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FinanceiroService } from '../../services/financeiro.service';

@Component({
  selector: 'app-divida-form',
  templateUrl: './divida-form.component.html',
  styleUrls: ['./divida-form.component.scss'],
  standalone: false,
})
export class DividaFormComponent implements OnInit {
  @Input() cartaoId?: string;
  @Input() categoriaId?: string;
  cartoes: any[] = [];
  categorias: any[] = [];

  formCompra!: FormGroup;
  modo: 'cartao' | 'categoria' = 'cartao';

  mostrandoCartoes = false;
  mostrandoCategorias = false;

  valorFormatado = 'R$ 0,00';
  valorDividaFormatado = 'R$ 0,00';

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
      valor: [null],
      compraFixa: [false],
      parcelaAtual: [1],
      totalParcelas: [1],
      descricao: [''],
      categoriaId: [''],
      nomeDivida: [''],
      valorDivida: [null],
      descricaoDivida: [''],
    });

    if (this.cartaoId) {
      this.formCompra.get('cartaoId')?.setValue(this.cartaoId);
    }
    if (this.categoriaId) {
      this.formCompra.get('categoriaId')?.setValue(this.categoriaId);
    }

    // Inicializa os valores formatados
    this.valorFormatado = this.formatarValor(
      this.formCompra.get('valor')?.value
    );
    this.valorDividaFormatado = this.formatarValor(
      this.formCompra.get('valorDivida')?.value
    );
  }

  get cartaoSelecionado() {
    const id = this.formCompra.get('cartaoId')?.value;
    return this.cartoes.find((c) => c.id === id);
  }

  get categoriaSelecionada() {
    const id = this.formCompra.get('categoriaId')?.value;
    return this.categorias.find((c) => c.id === id);
  }

  onInputValor(event: Event, campo: 'valor' | 'valorDivida') {
    const input = event.target as HTMLInputElement;
    let valorBruto = input.value.replace(/[^\d]/g, '');

    if (!valorBruto) valorBruto = '0';
    if (valorBruto.length < 3) valorBruto = valorBruto.padStart(3, '0');
    valorBruto = valorBruto.slice(0, 12);

    const numeroCentavos = parseInt(valorBruto, 10);
    const valorReal = numeroCentavos / 100;

    this.formCompra.get(campo)?.setValue(valorReal);

    // Atualiza o valor formatado para exibir no input
    const valorFormatado = this.formatarValor(valorReal);
    if (campo === 'valor') {
      this.valorFormatado = valorFormatado;
    } else {
      this.valorDividaFormatado = valorFormatado;
    }

    // Atualiza o input visualmente sem travar o cursor
    setTimeout(() => {
      input.value = valorFormatado;
    });
  }

  formatarValor(valor: number | string | null | undefined): string {
    let numeroLimpo: number = 0;
    if (typeof valor === 'string') {
      numeroLimpo = parseFloat(valor.replace(/[^0-9]/g, '') || '0');
    } else if (typeof valor === 'number') {
      numeroLimpo = valor;
    }
    return (numeroLimpo || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });
  }

  // ...restante do seu código (toggleSelect, selecionarCartao, selecionarCategoria, onToggleFixa, salvar etc)...
  toggleSelect(tipo: 'cartoes' | 'categorias') {
    if (tipo === 'cartoes') {
      this.mostrandoCartoes = !this.mostrandoCartoes;
      this.mostrandoCategorias = false;
    } else {
      this.mostrandoCategorias = !this.mostrandoCategorias;
      this.mostrandoCartoes = false;
    }
  }

  selecionarCartao(cartao: any, event?: Event) {
    if (event) event.stopPropagation();
    this.formCompra.get('cartaoId')?.setValue(cartao.id);
    this.mostrandoCartoes = false;
  }

  selecionarCategoria(categoria: any, event?: Event) {
    if (event) event.stopPropagation();
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

      const categoria = this.financeiroService.getCategoriaById(
        this.formCompra.value.categoriaId
      );

      if (categoria) {
        categoria.dividas.push(novaDivida);
        console.log('Dívida adicionada à categoria:', categoria);
      }
    }
  }
}
