import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FinanceiroService } from '../services/financeiro.service';
import { ModalController } from '@ionic/angular';
import { DividaFormComponent } from '../components/divida-form/divida-form.component';

@Component({
  selector: 'app-dividas',
  templateUrl: './dividas.page.html',
  styleUrls: ['./dividas.page.scss'],
  standalone: false,
})
export class DividasPage implements OnInit {
  categoria: any;
  dividas: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private financeiroService: FinanceiroService,
    private modalCtrl: ModalController // <- adicionado aqui
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
  

  async openAdicionarDivida() {
    const modal = await this.modalCtrl.create({
      component: DividaFormComponent,
      componentProps: {
        modo: 'categoria', // isso faz com que o formulário abra na aba correta
      },
      breakpoints: [0, 0.8, 0.9],
      initialBreakpoint: 0.8,
      showBackdrop: true,
      backdropDismiss: true,
    });

    await modal.present();
  }
}
