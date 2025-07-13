import { Injectable } from '@angular/core';
import { FirebaseService } from './core/firebase.service';
import { StorageService } from './core/storage.service';
import { CategoriaService } from './carteira/categoria.service';
import { CartaoService } from './cartoes/cartao.service';
import { CompraService } from './cartoes/compra.service';
import { CalculadoraService } from './shared/calculadora.service';
import { UtilsService } from './shared/utils.service';
import { CompromissoService } from './home/compromisso.service';
import { HomeService } from './home/home.service';

@Injectable({
  providedIn: 'root',
})
export class FinanceiroFacadeService {
  constructor(
    private firebaseService: FirebaseService,
    private storageService: StorageService,
    private categoriaService: CategoriaService,
    private cartaoService: CartaoService,
    private compraService: CompraService,
    private calculadoraService: CalculadoraService,
    private utilsService: UtilsService,
    private compromissoService: CompromissoService,
    private homeService: HomeService
  ) {}

  // ✅ Observable para sincronização
  get dadosAtualizados$() {
    return this.firebaseService.dadosAtualizados$;
  }

  // ✅ Inicialização e finalização
  async inicializar(uid: string) {
    await this.categoriaService.carregarFirebase(uid);
    await this.cartaoService.carregarFirebase(uid);
    await this.compromissoService.carregarStatusPagamentos(uid);
    this.firebaseService.iniciarListener(uid);
    this.configurarListener();
  }

  finalizar() {
    this.firebaseService.pararListener();
  }

  // ✅ Configurar listener para atualizar services
  private configurarListener() {
    this.firebaseService.dadosAtualizados$.subscribe((dados) => {
      console.log('🔄 Listener - Dados recebidos:', dados);

      if (dados['categorias']) {
        console.log('📝 Sincronizando categorias:', dados['categorias']);
        this.categoriaService.sincronizarDados(dados['categorias']);
      }
      if (dados['cartoes']) {
        console.log('💳 Sincronizando cartões:', dados['cartoes']);
        this.cartaoService.sincronizarDados(dados['cartoes']);
      }
      if (dados['pagamentos']) {
        this.storageService.sincronizarPagamentos(dados['pagamentos']);
      }
    });
  }

  // ✅ DELEGAÇÃO PARA CATEGORIAS
  getCategorias() {
    return this.categoriaService.getCategorias();
  }

  getCategoriaById(id: string) {
    return this.categoriaService.getCategoriaById(id);
  }

  async addCategoria(categoria: any, uid?: string) {
    console.log('🏷️ Facade - Criando categoria:', categoria);
    const resultado = await this.categoriaService.criarCategoria(
      categoria,
      uid
    );
    console.log('✅ Facade - Categoria criada:', resultado);
    return resultado;
  }

  async updateCategoria(categoriaEditada: any, uid?: string) {
    return await this.categoriaService.atualizarCategoria(
      categoriaEditada,
      uid
    );
  }

  async excluirCategoria(uid: string, categoriaId: string) {
    return await this.categoriaService.excluirCategoria(categoriaId, uid);
  }

  // ✅ DELEGAÇÃO PARA DÍVIDAS
  async adicionarDividaCategoria(
    categoriaId: string,
    divida: any,
    uid?: string
  ) {
    return await this.categoriaService.adicionarDivida(
      categoriaId,
      divida,
      uid
    );
  }

  async editarDividaCategoria(
    categoriaId: string,
    dividaIndex: number,
    dividaEditada: any,
    uid?: string
  ) {
    return await this.categoriaService.editarDivida(
      categoriaId,
      dividaIndex,
      dividaEditada,
      uid
    );
  }

  async removerDividaCategoria(
    categoriaId: string,
    dividaIndex: number,
    uid?: string
  ) {
    return await this.categoriaService.removerDivida(
      categoriaId,
      dividaIndex,
      uid
    );
  }

  // ✅ DELEGAÇÃO PARA CARTÕES
  getCartoes() {
    return this.cartaoService.getCartoes();
  }

  getCartaoById(id: string) {
    return this.cartaoService.getCartaoById(id);
  }

  async addCartao(cartao: any, uid?: string) {
    console.log('💳 Facade - Criando cartão:', cartao);
    const resultado = await this.cartaoService.criarCartao(cartao, uid);
    console.log('✅ Facade - Cartão criado:', resultado);
    return resultado;
  }

  async updateCartao(cartaoEditado: any, uid?: string) {
    return await this.cartaoService.atualizarCartao(cartaoEditado, uid);
  }

  async removerCartao(id: string, uid?: string) {
    return await this.cartaoService.excluirCartao(id, uid);
  }

  // ✅ DELEGAÇÃO PARA COMPRAS (métodos completos)
  async adicionarCompraCartao(cartaoId: string, compra: any, uid?: string) {
    return await this.compraService.adicionarCompra(cartaoId, compra, uid);
  }

  async editarCompraCartao(
    cartaoId: string,
    compraIndex: number,
    compraEditada: any,
    uid?: string
  ) {
    return await this.compraService.editarCompra(
      cartaoId,
      compraIndex,
      compraEditada,
      uid
    );
  }

  async removerCompraCartao(
    cartaoId: string,
    compraIndex: number,
    uid?: string
  ) {
    return await this.compraService.removerCompra(cartaoId, compraIndex, uid);
  }

  // ✅ DELEGAÇÃO PARA CÁLCULOS
  getTotalDividasCategoria(categoriaId: string): number {
    const categoria = this.getCategoriaById(categoriaId);
    return this.calculadoraService.calcularTotalCategoria(categoria);
  }

  getQuantidadeDividasCategoria(categoriaId: string): number {
    const categoria = this.getCategoriaById(categoriaId);
    return this.calculadoraService.calcularQuantidadeDividasCategoria(
      categoria
    );
  }

  getValorTotalCartao(cartaoId: string): number {
    const cartao = this.getCartaoById(cartaoId);
    return this.calculadoraService.calcularTotalCartao(cartao);
  }

  getValorTotalCartoes(): number {
    return this.calculadoraService.calcularTotalCartoes(this.getCartoes());
  }

  getValorTotalCategorias(): number {
    return this.calculadoraService.calcularTotalCategorias(
      this.getCategorias()
    );
  }

  getValorTotalGeral(): number {
    return this.calculadoraService.calcularTotalGeral(
      this.getCategorias(),
      this.getCartoes()
    );
  }

  getValorTotalDividas(): number {
    return this.calculadoraService.calcularTotalDividas(
      this.getCategorias(),
      this.getCartoes()
    );
  }

  getQuantidadeCartoes(): number {
    return this.calculadoraService.contarCartoes(this.getCartoes());
  }

  getQuantidadeCategorias(): number {
    return this.calculadoraService.contarCategorias(this.getCategorias());
  }

  generateGradient(baseColor: string): string {
    return this.utilsService.gerarGradiente(baseColor);
  }

  // ✅ DELEGAÇÃO PARA COMPROMISSOS
  async alternarStatusPagamento(
    compromissoId: string,
    pago: boolean,
    uid?: string
  ) {
    return await this.compromissoService.alternarStatusPagamento(
      compromissoId,
      pago,
      uid
    );
  }

  // ✅ DELEGAÇÃO PARA HOME
  obterResumoHome() {
    return this.homeService.obterResumoHome();
  }

  obterCompromissosMesAtual() {
    return this.compromissoService.obterCompromissosMesAtual();
  }

  // ✅ MÉTODOS DE FIREBASE (SEM DUPLICAÇÃO)
  async carregarFirebase(uid: string) {
    await this.categoriaService.carregarFirebase(uid);
    await this.cartaoService.carregarFirebase(uid);
  }

  async salvarFirebase(uid: string) {
    const dados = {
      cartoes: this.getCartoes(),
      categorias: this.getCategorias(),
    };
    return await this.firebaseService.salvarDados(uid, dados);
  }

  async recuperarDadosFirebase(uid: string) {
    const dados = await this.firebaseService.carregarDados(uid);
    if (dados) {
      if (dados['categorias']) {
        this.categoriaService.sincronizarDados(dados['categorias']);
      }
      if (dados['cartoes']) {
        this.cartaoService.sincronizarDados(dados['cartoes']);
      }
      if (dados['pagamentos']) {
        this.storageService.sincronizarPagamentos(dados['pagamentos']);
      }
    }
  }

  async carregarCategoriasDoFirebase(uid: string) {
    await this.categoriaService.carregarFirebase(uid);
    return this.categoriaService.getCategorias();
  }

  // ✅ MÉTODOS AUXILIARES
  async salvarDadosUsuario(uid: string, dados: any) {
    return await this.firebaseService.salvarDados(uid, dados);
  }

  carregarLocal() {
    this.categoriaService.carregarLocal();
    this.cartaoService.carregarLocal();
  }

  // ✅ Adicione métodos faltantes
  async carregarStatusPagamentos(uid: string) {
    return await this.compromissoService.carregarStatusPagamentos(uid);
  }

  async salvarStatusPagamento(
    uid: string,
    compromissoId: string,
    pago: boolean
  ) {
    return await this.firebaseService.salvarStatusPagamento(
      uid,
      compromissoId,
      pago
    );
  }

  iniciarListenerFirebase(uid: string) {
    this.firebaseService.iniciarListener(uid);
  }

  pararListenerFirebase() {
    this.firebaseService.pararListener();
  }

  // ✅ Método para mostrar splash simples quando necessário
  public mostrarSplashCarregamento() {
    // Dispara evento para mostrar splash simples
    document.dispatchEvent(new CustomEvent('mostrar-splash-simples'));
  }
}
