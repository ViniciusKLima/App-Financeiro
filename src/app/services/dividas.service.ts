import { Injectable } from '@angular/core';

export interface Divida {
  id: string;
  nome: string;
  valor: number;
  dia: number; // Dia do mês (1 a 31)
  foiPago: boolean;
  categoria: string;
}

@Injectable({ providedIn: 'root' })
export class DividaService {
  private dividas: Divida[] = [
    { id: '1', nome: 'Cartão Nubank', valor: 150, dia: 3, foiPago: false, categoria: 'Cartões' },
    { id: '2', nome: 'Aluguel Escritório', valor: 700, dia: 32, foiPago: true, categoria: 'Trabalho' },
    { id: '3', nome: 'Energia', valor: 250, dia: 31, foiPago: false, categoria: 'Casa' },
    { id: '4', nome: 'Cartão Itaú', valor: 200, dia: 4, foiPago: false, categoria: 'Cartões' },
    { id: '5', nome: 'Salário secretária', valor: 1000, dia: 1, foiPago: false, categoria: 'Trabalho' }
  ];

  getDividas(): Divida[] {
    return this.dividas;
  }

  togglePago(id: string): void {
    const divida = this.dividas.find(d => d.id === id);
    if (divida) divida.foiPago = !divida.foiPago;
  }
}
