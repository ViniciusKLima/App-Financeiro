import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  // Geração de IDs únicos
  gerarId(): string {
    return (Math.random() * 100000).toFixed(0);
  }

  // Formatação de valores
  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  formatarNumero(valor: number, decimais: number = 2): string {
    return valor.toFixed(decimais);
  }

  // Validações
  validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validarValorMonetario(valor: string): boolean {
    const valorNumerico = parseFloat(valor);
    return !isNaN(valorNumerico) && valorNumerico > 0;
  }

  // Formatação de datas
  formatarData(data: Date): string {
    return data.toLocaleDateString('pt-BR');
  }

  formatarDataISO(data: Date): string {
    return data.toISOString().slice(0, 10);
  }

  obterDataAtual(): string {
    return new Date().toISOString().slice(0, 10);
  }

  // Manipulação de strings
  limparTexto(texto: string): string {
    return texto.trim().toLowerCase();
  }

  capitalizarPrimeira(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  // Ordenação
  ordenarPorValor(
    array: any[],
    campo: string,
    crescente: boolean = true
  ): any[] {
    return array.sort((a, b) => {
      const valorA = parseFloat(a[campo]) || 0;
      const valorB = parseFloat(b[campo]) || 0;
      return crescente ? valorA - valorB : valorB - valorA;
    });
  }

  ordenarPorData(
    array: any[],
    campo: string,
    crescente: boolean = true
  ): any[] {
    return array.sort((a, b) => {
      const dataA = new Date(a[campo]).getTime();
      const dataB = new Date(b[campo]).getTime();
      return crescente ? dataA - dataB : dataB - dataA;
    });
  }

  // Verificação de conectividade
  estaOnline(): boolean {
    return navigator.onLine;
  }

  // Debounce para otimizar pesquisas
  debounce(func: Function, delay: number) {
    let timeoutId: any;
    return function(this: any, ...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Cores e gradientes
  gerarGradiente(baseColor: string): string {
    const darkColor = this.escurecerCor(baseColor, 30);
    return `linear-gradient(135deg, ${baseColor}, ${darkColor})`;
  }

  private escurecerCor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00ff) - amt;
    const B = (num & 0x0000ff) - amt;

    const clamp = (val: number) => Math.max(Math.min(255, val), 0);

    return (
      '#' +
      ('0' + clamp(R).toString(16)).slice(-2) +
      ('0' + clamp(G).toString(16)).slice(-2) +
      ('0' + clamp(B).toString(16)).slice(-2)
    );
  }

  // Arrays e objetos
  clonarObjeto(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
  }

  compararObjetos(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  removerDuplicados(array: any[], campo?: string): any[] {
    if (campo) {
      return array.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t[campo] === item[campo])
      );
    }
    return [...new Set(array)];
  }
}
