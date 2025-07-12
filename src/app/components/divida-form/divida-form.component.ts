import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FinanceiroService } from '../../services/financeiro.service';
import { AuthService } from '../../services/auth.service'; // Adicione este import

@Component({
  selector: 'app-divida-form',
  templateUrl: './divida-form.component.html',
  styleUrls: ['./divida-form.component.scss'],
  standalone: false,
})
export class DividaFormComponent implements OnInit {
  @Input() cartaoId?: string;
  @Input() categoriaId?: string;
  @Input() compra?: any;
  @Input() compraIndex?: number;
  cartoes: any[] = [];
  categorias: any[] = [];

  formCompra!: FormGroup;
  modo: 'cartao' | 'categoria' = 'cartao';

  mostrandoCartoes = false;
  mostrandoCategorias = false;

  valorFormatado = 'R$ 0,00';
  valorDividaFormatado = 'R$ 0,00';

  formTouched = false;
  public salvando = false;

  constructor(
    private financeiroService: FinanceiroService,
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private authService: AuthService // Adicione aqui
  ) {}

  ngOnInit() {
    this.cartoes = this.financeiroService.getCartoes();
    this.categorias = this.financeiroService.getCategorias();

    this.formCompra = this.fb.group({
      cartaoId: ['', this.modo === 'cartao' ? Validators.required : []],
      nomeCompra: ['', this.modo === 'cartao' ? Validators.required : []],
      valor: [null, this.modo === 'cartao' ? Validators.required : []],
      compraFixa: [false],
      parcelaAtual: [1, this.modo === 'cartao' ? Validators.required : []],
      totalParcelas: [1, this.modo === 'cartao' ? Validators.required : []],
      descricao: [''],
      categoriaId: ['', this.modo === 'categoria' ? Validators.required : []],
      nomeDivida: ['', this.modo === 'categoria' ? Validators.required : []],
      valorDivida: [null, this.modo === 'categoria' ? Validators.required : []],
      descricaoDivida: [''],
      diaPagamento: [
        null,
        this.modo === 'categoria' ? Validators.required : [],
      ],
    });

    if (this.cartaoId) {
      this.formCompra.get('cartaoId')?.setValue(this.cartaoId);
    }
    if (this.categoriaId) {
      this.formCompra.get('categoriaId')?.setValue(this.categoriaId);
    }

    if (this.compra) {
      this.formCompra.patchValue({
        nomeCompra: this.compra.nome,
        valor: this.compra.valor,
        parcelaAtual: this.compra.parcelaAtual,
        totalParcelas: this.compra.totalParcelas,
        descricao: this.compra.descricao,
      });
      this.valorFormatado = this.formatarValor(this.compra.valor);
    }

    // Inicializa os valores formatados
    this.valorFormatado = this.formatarValor(
      this.formCompra.get('valor')?.value
    );
    this.valorDividaFormatado = this.formatarValor(
      this.formCompra.get('valorDivida')?.value
    );

    if (this.modo === 'categoria' && this.compra) {
      this.formCompra.patchValue({
        nomeDivida: this.compra.nome,
        valorDivida: this.compra.valor,
        diaPagamento: this.compra.diaPagamento,
        descricaoDivida: this.compra.descricao,
      });
      this.valorDividaFormatado = this.formatarValor(this.compra.valor);
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

  async salvar() {
    if (this.salvando) return; // Evita duplo disparo
    this.salvando = true;
    this.formTouched = true;
    if (this.formCompra.invalid) {
      Object.values(this.formCompra.controls).forEach((control) => {
        control.markAsTouched();
      });
      this.salvando = false;
      return;
    }
    const uid = this.authService.usuarioAtual?.uid;
    if (this.modo === 'cartao') {
      const novaCompra = this.formCompra.value;
      const cartao = this.financeiroService.getCartaoById(novaCompra.cartaoId);
      const compraEditada = {
        nome: novaCompra.nomeCompra,
        valor: novaCompra.valor,
        parcelaAtual: novaCompra.parcelaAtual,
        totalParcelas: novaCompra.totalParcelas,
        descricao: novaCompra.descricao,
        compraFixa: novaCompra.compraFixa, // <-- adicione esta linha
      };
      if (this.compraIndex !== undefined && cartao) {
        // Edição
        cartao.compras[this.compraIndex] = compraEditada;
        if (uid) await this.financeiroService.salvarFirebase(uid);
        await this.modalCtrl.dismiss({
          tipo: 'cartao',
          compraEditada,
          cartaoId: cartao.id,
        });
      } else if (cartao) {
        // Nova compra
        cartao.compras.push(compraEditada);
        if (uid) await this.financeiroService.salvarFirebase(uid);
        await this.modalCtrl.dismiss({
          tipo: 'cartao',
          compra: compraEditada,
          cartaoId: cartao.id,
        });
      }
    } else {
      const novaDivida = {
        nome: this.formCompra.value.nomeDivida,
        diaPagamento: this.formCompra.value.diaPagamento,
        valor: this.formCompra.value.valorDivida,
        descricao: this.formCompra.value.descricaoDivida,
      };

      const categoria = this.financeiroService.getCategoriaById(
        this.formCompra.value.categoriaId
      );
      if (categoria) {
        if (this.compraIndex !== undefined) {
          // Edição
          categoria.dividas[this.compraIndex] = novaDivida;
        } else {
          // Nova dívida
          if (!categoria.dividas) categoria.dividas = [];
          categoria.dividas.push(novaDivida);
        }
      }
      if (uid) await this.financeiroService.salvarFirebase(uid);
      await this.modalCtrl.dismiss({
        tipo: 'categoria',
        divida: novaDivida,
        categoriaId: categoria?.id,
      });
    }
    this.salvando = false;
  }

  async excluir() {
    const uid = this.authService.usuarioAtual?.uid;
    if (this.modo === 'cartao') {
      const cartao = this.financeiroService.getCartaoById(
        this.formCompra.value.cartaoId
      );
      if (cartao && this.compraIndex !== undefined) {
        cartao.compras.splice(this.compraIndex, 1);
        if (uid) await this.financeiroService.salvarFirebase(uid);
        await this.modalCtrl.dismiss({ excluido: true, cartaoId: cartao.id });
      }
    } else {
      const categoria = this.financeiroService.getCategoriaById(
        this.formCompra.value.categoriaId
      );
      if (categoria && this.compraIndex !== undefined) {
        categoria.dividas.splice(this.compraIndex, 1);
        if (uid) await this.financeiroService.salvarFirebase(uid);
        await this.modalCtrl.dismiss({
          excluido: true,
          categoriaId: categoria.id,
        });
      }
    }
  }

  cancelar() {
    this.modalCtrl.dismiss();
  }
}
