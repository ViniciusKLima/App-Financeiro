import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FinanceiroService } from '../services/financeiro.service';

@Component({
  selector: 'app-dividas',
  templateUrl: './dividas.page.html',
  styleUrls: ['./dividas.page.scss'],
  standalone: false
})
export class DividasPage implements OnInit {
  categoria: any;
  dividas: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private financeiroService: FinanceiroService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.categoria = this.financeiroService.getCategoriaById(id!);
    this.dividas = this.categoria?.dividas ? [...this.categoria.dividas] : [];
    this.ordenarDividasPorDia();
  }

  ordenarDividasPorDia() {
    this.dividas.sort((a, b) => a.diaPagamento - b.diaPagamento);
  }
}