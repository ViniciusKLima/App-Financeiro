import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FinanceiroFacadeService } from '../../services/financeiro-facade.service';

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
  cartaoAtivo?: any;

  formCompra!: FormGroup;
  modo: 'cartao' | 'categoria' = 'cartao';

  mostrandoCartoes = false;
  mostrandoCategorias = false;

  valorFormatado = 'R$ 0,00';
  valorDividaFormatado = 'R$ 0,00';

  formTouched = false;
  public salvando = false;

  constructor(
    private financeiroFacade: FinanceiroFacadeService,
    private fb: FormBuilder,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    console.log('🔄 DividaForm - Inicializando...');
    console.log('Modo:', this.modo);
    console.log('CartaoId:', this.cartaoId);
    console.log('CategoriaId:', this.categoriaId);
    console.log('Compra:', this.compra);
    console.log('CompraIndex:', this.compraIndex);

    // ✅ Definir modo baseado nos inputs
    if (this.categoriaId) {
      this.modo = 'categoria';
    } else if (this.cartaoId) {
      this.modo = 'cartao';
    }

    // ✅ Carregar dados
    this.cartoes = this.financeiroFacade.getCartoes();
    this.categorias = this.financeiroFacade.getCategorias();

    console.log('Cartões carregados:', this.cartoes);
    console.log('Categorias carregadas:', this.categorias);

    // ✅ Inicializar formulário
    this.inicializarFormulario();

    // ✅ Preencher dados se for edição
    if (this.compra) {
      this.preencherDadosEdicao();
    }
  }

  private inicializarFormulario() {
    this.formCompra = this.fb.group({
      // Campos para cartão
      cartaoId: [
        this.cartaoId || '',
        this.modo === 'cartao' ? Validators.required : [],
      ],
      nomeCompra: ['', this.modo === 'cartao' ? Validators.required : []],
      valor: [null, this.modo === 'cartao' ? Validators.required : []],
      compraFixa: [false],
      parcelaAtual: [1],
      totalParcelas: [1],
      descricao: [''],

      // Campos para categoria
      categoriaId: [
        this.categoriaId || '',
        this.modo === 'categoria' ? Validators.required : [],
      ],
      nomeDivida: ['', this.modo === 'categoria' ? Validators.required : []],
      valorDivida: [null, this.modo === 'categoria' ? Validators.required : []],
      descricaoDivida: [''],
      diaPagamento: [
        null,
        this.modo === 'categoria'
          ? [Validators.required, Validators.min(1), Validators.max(31)]
          : [],
      ],
    });

    console.log('📝 Formulário inicializado:', this.formCompra.value);
  }

  private preencherDadosEdicao() {
    if (this.modo === 'cartao') {
      this.formCompra.patchValue({
        nomeCompra: this.compra.nome,
        valor: this.compra.valor,
        parcelaAtual: this.compra.parcelaAtual || 1,
        totalParcelas: this.compra.totalParcelas || 1,
        descricao: this.compra.descricao || '',
        compraFixa: this.compra.compraFixa || false,
      });
      this.valorFormatado = this.formatarValor(this.compra.valor);
    } else {
      this.formCompra.patchValue({
        nomeDivida: this.compra.nome,
        valorDivida: this.compra.valor,
        diaPagamento: this.compra.diaPagamento,
        descricaoDivida: this.compra.descricao || '',
      });
      this.valorDividaFormatado = this.formatarValor(this.compra.valor);
    }

    console.log('📝 Dados de edição preenchidos:', this.formCompra.value);
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

    const valorFormatado = this.formatarValor(valorReal);
    if (campo === 'valor') {
      this.valorFormatado = valorFormatado;
    } else {
      this.valorDividaFormatado = valorFormatado;
    }

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
    console.log('🎯 Cartão selecionado:', cartao);
  }

  selecionarCategoria(categoria: any, event?: Event) {
    if (event) event.stopPropagation();
    this.formCompra.get('categoriaId')?.setValue(categoria.id);
    this.mostrandoCategorias = false;
    console.log('🎯 Categoria selecionada:', categoria);
  }

  onToggleFixa() {
    const parcelaAtual = this.formCompra.get('parcelaAtual');
    const totalParcelas = this.formCompra.get('totalParcelas');
    const isFixa = this.formCompra.value.compraFixa;

    if (isFixa) {
      parcelaAtual?.setValue(1);
      totalParcelas?.setValue(1);
      parcelaAtual?.disable({ emitEvent: false });
      totalParcelas?.disable({ emitEvent: false });
    } else {
      parcelaAtual?.enable({ emitEvent: false });
      totalParcelas?.enable({ emitEvent: false });
    }
  }

  async salvar() {
    if (this.salvando) return;
    this.salvando = true;
    this.formTouched = true;

    console.log('💾 Iniciando salvamento...');
    console.log('Modo:', this.modo);
    console.log('Formulário:', this.formCompra.value);
    console.log('Formulário válido:', this.formCompra.valid);

    if (this.formCompra.invalid) {
      console.log('❌ Formulário inválido');
      Object.values(this.formCompra.controls).forEach((control) => {
        control.markAsTouched();
      });
      this.salvando = false;
      return;
    }

    const uid = localStorage.getItem('uid') || undefined;

    try {
      if (this.modo === 'cartao') {
        await this.salvarCompra(uid);
      } else {
        await this.salvarDivida(uid);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
    }

    this.salvando = false;
  }

  private async salvarCompra(uid?: string) {
    const dadosForm = this.formCompra.value;
    const novaCompra = {
      nome: dadosForm.nomeCompra,
      valor: dadosForm.valor,
      parcelaAtual: dadosForm.compraFixa ? 1 : dadosForm.parcelaAtual,
      totalParcelas: dadosForm.compraFixa ? 1 : dadosForm.totalParcelas,
      descricao: dadosForm.descricao || '',
      compraFixa: dadosForm.compraFixa || false,
    };

    console.log('💳 Salvando compra:', novaCompra);
    console.log('Cartão ID:', dadosForm.cartaoId);
    console.log('Índice:', this.compraIndex);

    if (this.compraIndex !== undefined) {
      // ✅ Editando compra existente
      await this.financeiroFacade.editarCompraCartao(
        dadosForm.cartaoId,
        this.compraIndex,
        novaCompra,
        uid
      );
      console.log('✅ Compra editada com sucesso');
    } else {
      // ✅ Nova compra
      await this.financeiroFacade.adicionarCompraCartao(
        dadosForm.cartaoId,
        novaCompra,
        uid
      );
      console.log('✅ Compra adicionada com sucesso');
    }

    await this.modalCtrl.dismiss({
      salvo: true,
      tipo: 'cartao',
      compra: novaCompra,
      cartaoId: dadosForm.cartaoId,
      acao: this.compraIndex !== undefined ? 'editou' : 'criou',
    });
  }

  private async salvarDivida(uid?: string) {
    const dadosForm = this.formCompra.value;
    const novaDivida = {
      nome: dadosForm.nomeDivida,
      valor: dadosForm.valorDivida,
      diaPagamento: dadosForm.diaPagamento,
      descricao: dadosForm.descricaoDivida || '',
    };

    console.log('📝 Salvando dívida:', novaDivida);
    console.log('Categoria ID:', dadosForm.categoriaId);
    console.log('Índice:', this.compraIndex);

    if (this.compraIndex !== undefined) {
      // ✅ Editando dívida existente
      await this.financeiroFacade.editarDividaCategoria(
        dadosForm.categoriaId,
        this.compraIndex,
        novaDivida,
        uid
      );
      console.log('✅ Dívida editada com sucesso');
    } else {
      // ✅ Nova dívida
      await this.financeiroFacade.adicionarDividaCategoria(
        dadosForm.categoriaId,
        novaDivida,
        uid
      );
      console.log('✅ Dívida adicionada com sucesso');
    }

    await this.modalCtrl.dismiss({
      salvo: true,
      tipo: 'categoria',
      divida: novaDivida,
      categoriaId: dadosForm.categoriaId,
      acao: this.compraIndex !== undefined ? 'editou' : 'criou',
    });
  }

  async excluir() {
    const uid = localStorage.getItem('uid') || undefined;

    try {
      if (this.modo === 'cartao') {
        await this.financeiroFacade.removerCompraCartao(
          this.formCompra.value.cartaoId,
          this.compraIndex!,
          uid
        );
        console.log('✅ Compra excluída com sucesso');
      } else {
        await this.financeiroFacade.removerDividaCategoria(
          this.formCompra.value.categoriaId,
          this.compraIndex!,
          uid
        );
        console.log('✅ Dívida excluída com sucesso');
      }

      await this.modalCtrl.dismiss({
        excluido: true,
        tipo: this.modo,
        [this.modo === 'cartao' ? 'cartaoId' : 'categoriaId']:
          this.formCompra.value[
            this.modo === 'cartao' ? 'cartaoId' : 'categoriaId'
          ],
      });
    } catch (error) {
      console.error('❌ Erro ao excluir:', error);
    }
  }

  cancelar() {
    this.modalCtrl.dismiss();
  }

  // ✅ Adicione método para validar dia
  validarDiaPagamento(event: any) {
    const valor = parseInt(event.target.value);
    if (valor < 1) {
      event.target.value = 1;
      this.formCompra.get('diaPagamento')?.setValue(1);
    } else if (valor > 31) {
      event.target.value = 31;
      this.formCompra.get('diaPagamento')?.setValue(31);
    }
  }

  // No método openAdicionarCompra ou onde criar compras
  async openAdicionarCompra() {
    const modal = await this.modalCtrl.create({
      component: DividaFormComponent,
      componentProps: {
        modo: 'cartao',
        cartaoId: this.cartaoAtivo?.id,
      },
      breakpoints: [0, 0.8, 0.9],
      initialBreakpoint: 0.9,
      showBackdrop: true,
      backdropDismiss: true,
    });

    modal.onDidDismiss().then(async (retorno) => {
      if (retorno.data) {
        // ✅ Validar dados antes de salvar
        const compraValidada = {
          ...retorno.data,
          nome: retorno.data.nome || 'Compra sem nome',
          valor: retorno.data.valor || 0,
          parcelaAtual: retorno.data.parcelaAtual || 1,
          totalParcelas: retorno.data.totalParcelas || 1,
          compraFixa: retorno.data.compraFixa || false,
        };

        const uid = localStorage.getItem('uid');
        if (uid) {
          await this.financeiroFacade.adicionarCompraCartao(
            this.cartaoAtivo?.id,
            compraValidada,
            uid
          );
        }

        // Atualiza a lista local
        this.cartoes = this.financeiroFacade
          .getCartoes()
          .map((cartao: any) => ({
            ...cartao,
            gradient: this.financeiroFacade.generateGradient(cartao.cor),
          }));
      }
    });

    await modal.present();
  }
}
