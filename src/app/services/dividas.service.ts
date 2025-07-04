import { Injectable } from '@angular/core';

export interface Divida {
  id: string;
  nome: string;
  valor: number;
  dia: number; // Dia do mês (1 a 31)
  foiPago: boolean;
  categoria: string;
  cor?: string; // <-- Adicione isso
  icone?: string; // <-- E isso também
}

@Injectable({ providedIn: 'root' })
export class DividaService {
  private dividas: Divida[] = [
    {
      id: '1',
      nome: 'Cartão Nubank',
      valor: 150,
      dia: 3,
      foiPago: false,
      categoria: 'Cartões',
      cor: '#6F42C1',
      icone: 'card-outline',
    },
    {
      id: '2',
      nome: 'Aluguel Escritório',
      valor: 700,
      dia: 3,
      foiPago: true,
      categoria: 'Trabalho',
      cor: '#E83E8C',
      icone: 'briefcase-outline',
    },
    {
      id: '3',
      nome: 'Energia',
      valor: 250,
      dia: 4,
      foiPago: false,
      categoria: 'Casa',
      cor: '#FFC107',
      icone: 'flash-outline',
    },
    {
      id: '4',
      nome: 'Cartão Itaú',
      valor: 200,
      dia: 4,
      foiPago: false,
      categoria: 'Cartões',
      cor: '#6F42C1',
      icone: 'card-outline',
    },
    {
      id: '5',
      nome: 'Salário secretária',
      valor: 1000,
      dia: 1,
      foiPago: false,
      categoria: 'Trabalho',
      cor: '#E83E8C',
      icone: 'person-outline',
    },

    // Novas dívidas
    {
      id: '6',
      nome: 'Internet Fibra',
      valor: 99.9,
      dia: 5,
      foiPago: false,
      categoria: 'Casa',
      cor: '#17A2B8',
      icone: 'wifi-outline',
    },
    {
      id: '7',
      nome: 'Prestação Moto',
      valor: 320,
      dia: 6,
      foiPago: false,
      categoria: 'Veículo',
      cor: '#343A40',
      icone: 'bicycle-outline',
    },
    {
      id: '8',
      nome: 'Curso Online',
      valor: 150,
      dia: 8,
      foiPago: false,
      categoria: 'Educação',
      cor: '#6610F2',
      icone: 'school-outline',
    },
    {
      id: '9',
      nome: 'Netflix',
      valor: 39.9,
      dia: 9,
      foiPago: false,
      categoria: 'Entretenimento',
      cor: '#DC3545',
      icone: 'film-outline',
    },
    {
      id: '10',
      nome: 'Spotify',
      valor: 19.9,
      dia: 9,
      foiPago: false,
      categoria: 'Entretenimento',
      cor: '#28A745',
      icone: 'musical-notes-outline',
    },
    {
      id: '11',
      nome: 'Academia',
      valor: 100,
      dia: 9,
      foiPago: false,
      categoria: 'Saúde',
      cor: '#20C997',
      icone: 'fitness-outline',
    },
    {
      id: '12',
      nome: 'Seguro Carro',
      valor: 220,
      dia: 13,
      foiPago: false,
      categoria: 'Veículo',
      cor: '#343A40',
      icone: 'car-outline',
    },
    {
      id: '13',
      nome: 'Farmácia',
      valor: 80,
      dia: 14,
      foiPago: false,
      categoria: 'Saúde',
      cor: '#20C997',
      icone: 'medkit-outline',
    },
    {
      id: '14',
      nome: 'Presente Aniversário',
      valor: 120,
      dia: 15,
      foiPago: false,
      categoria: 'Pessoal',
      cor: '#FD7E14',
      icone: 'gift-outline',
    },
    {
      id: '15',
      nome: 'Material Escritório',
      valor: 60,
      dia: 18,
      foiPago: false,
      categoria: 'Trabalho',
      cor: '#007BFF',
      icone: 'document-outline',
    },
    {
      id: '16',
      nome: 'Feira do Mês',
      valor: 300,
      dia: 21,
      foiPago: false,
      categoria: 'Casa',
      cor: '#FFC107',
      icone: 'basket-outline',
    },
    {
      id: '17',
      nome: 'Manutenção Notebook',
      valor: 150,
      dia: 25,
      foiPago: false,
      categoria: 'Trabalho',
      cor: '#6610F2',
      icone: 'laptop-outline',
    },
    {
      id: '18',
      nome: 'Dentista',
      valor: 250,
      dia: 28,
      foiPago: false,
      categoria: 'Saúde',
      cor: '#20C997',
      icone: 'medkit-outline',
    },
    {
      id: '19',
      nome: 'IPTU',
      valor: 480,
      dia: 30,
      foiPago: false,
      categoria: 'Casa',
      cor: '#FFC107',
      icone: 'home-outline',
    },
  ];

  getDividas(): Divida[] {
    return this.dividas;
  }

  togglePago(id: string): void {
    const divida = this.dividas.find((d) => d.id === id);
    if (divida) divida.foiPago = !divida.foiPago;
  }
}
