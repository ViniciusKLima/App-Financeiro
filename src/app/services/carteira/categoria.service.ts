import { Injectable } from '@angular/core';
import { FirebaseService } from '../core/firebase.service';
import { StorageService } from '../core/storage.service';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private categorias: any[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private storageService: StorageService
  ) {}

  // Getters
  getCategorias() {
    console.log(
      '📊 Categoria Service - Retornando categorias:',
      this.categorias
    );
    return Array.isArray(this.categorias) ? this.categorias : [];
  }

  getCategoriaById(id: string) {
    return Array.isArray(this.categorias) && this.categorias.length > 0
      ? this.categorias.find((cat) => cat.id === id)
      : undefined;
  }

  // CRUD de categorias
  async criarCategoria(categoria: any, uid?: string): Promise<any> {
    // ✅ Verifica se já existe para evitar duplicação
    const existe = this.categorias.find((c) => c.nome === categoria.nome);
    if (existe) {
      console.warn('⚠️ Categoria já existe:', categoria.nome);
      return existe;
    }

    const novaCategoria = {
      id: this.gerarId(),
      nome: categoria.nome,
      cor: categoria.cor,
      icone: categoria.icone,
      somarAoTotal: categoria.somarAoTotal ?? true,
      dividas: categoria.dividas || [],
    };

    // ✅ Adiciona à lista local
    this.categorias.push(novaCategoria);
    this.salvarLocal();

    // ✅ Salva no Firebase
    if (uid) {
      await this.salvarFirebase(uid);
    }

    console.log('✅ Categoria criada:', novaCategoria);
    return novaCategoria;
  }

  async atualizarCategoria(categoriaEditada: any, uid?: string) {
    if (!Array.isArray(this.categorias) || this.categorias.length === 0) return;
    const idx = this.categorias.findIndex(
      (categoria) => categoria.id === categoriaEditada.id
    );
    if (idx !== -1) {
      this.categorias[idx] = { ...this.categorias[idx], ...categoriaEditada };
      this.salvarLocal();

      if (uid) {
        await this.salvarFirebase(uid);
      }
    }
  }

  async excluirCategoria(categoriaId: string, uid?: string) {
    try {
      this.categorias = this.categorias.filter(
        (categoria) => categoria.id !== categoriaId
      );
      this.salvarLocal();

      if (uid) {
        await this.salvarFirebase(uid);
      }

      console.log('Categoria excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      throw error;
    }
  }

  // CRUD de dívidas
  async adicionarDivida(categoriaId: string, divida: any, uid?: string) {
    try {
      const categoria = this.getCategoriaById(categoriaId);
      if (!categoria) {
        console.error('Categoria não encontrada:', categoriaId);
        return;
      }

      if (!Array.isArray(categoria.dividas)) {
        categoria.dividas = [];
      }

      divida.id = (Math.random() * 100000).toFixed(0);
      categoria.dividas.push(divida);

      this.salvarLocal();

      if (uid) {
        await this.salvarFirebase(uid);
      }
    } catch (error) {
      console.error('Erro ao adicionar dívida:', error);
      throw error;
    }
  }

  async editarDivida(
    categoriaId: string,
    dividaIndex: number,
    dividaEditada: any,
    uid?: string
  ) {
    try {
      const categoria = this.getCategoriaById(categoriaId);
      if (!categoria || !Array.isArray(categoria.dividas)) {
        console.error('Categoria ou dívidas não encontradas');
        return;
      }

      if (dividaIndex >= 0 && dividaIndex < categoria.dividas.length) {
        categoria.dividas[dividaIndex] = {
          ...categoria.dividas[dividaIndex],
          ...dividaEditada,
        };
        this.salvarLocal();

        if (uid) {
          await this.salvarFirebase(uid);
        }
      }
    } catch (error) {
      console.error('Erro ao editar dívida:', error);
      throw error;
    }
  }

  async removerDivida(categoriaId: string, dividaIndex: number, uid?: string) {
    try {
      const categoria = this.getCategoriaById(categoriaId);
      if (!categoria || !Array.isArray(categoria.dividas)) {
        console.error('Categoria ou dívidas não encontradas');
        return;
      }

      if (dividaIndex >= 0 && dividaIndex < categoria.dividas.length) {
        categoria.dividas.splice(dividaIndex, 1);
        this.salvarLocal();

        if (uid) {
          await this.salvarFirebase(uid);
        }
      }
    } catch (error) {
      console.error('Erro ao remover dívida:', error);
      throw error;
    }
  }

  // Persistência
  carregarLocal() {
    const dados = this.storageService.carregarDados();
    this.categorias = dados.categorias;
  }

  salvarLocal() {
    const dados = this.storageService.carregarDados();
    dados.categorias = this.categorias;
    this.storageService.salvarDados(dados);
  }

  async carregarFirebase(uid: string) {
    try {
      const dados = await this.firebaseService.carregarDados(uid);
      if (dados && dados['categorias']) {
        this.categorias = dados['categorias'];
        this.salvarLocal();
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      this.carregarLocal();
    }
  }

  async salvarFirebase(uid: string) {
    await this.firebaseService.salvarDados(uid, {
      categorias: this.categorias,
    });
  }

  // Método para sincronizar dados do listener
  sincronizarDados(categorias: any[]) {
    console.log('🔄 Categoria Service - Sincronizando dados:', categorias);

    // ✅ SUBSTITUI completamente em vez de adicionar
    this.categorias = Array.isArray(categorias) ? [...categorias] : [];

    this.salvarLocal();
    console.log('✅ Categoria Service - Dados sincronizados:', this.categorias);
  }

  // ✅ Método para verificar duplicação
  private gerarId(): string {
    let id: string;
    do {
      id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    } while (this.categorias.some((c) => c.id === id));
    return id;
  }
}
