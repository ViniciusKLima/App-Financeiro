import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FinanceiroService } from '../services/financeiro.service';
import { ModalController, NavController } from '@ionic/angular';
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
    public financeiroService: FinanceiroService, // <-- troque para public
    private modalCtrl: ModalController, // <- adicionado aqui
    private navCtrl: NavController // <--- adicione aqui
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
        categoriaId: this.categoria?.id,
      },
      breakpoints: [0, 0.8, 0.9],
      initialBreakpoint: 0.8,
      showBackdrop: true,
      backdropDismiss: true,
    });

    modal.onDidDismiss().then(() => {
      this.doRefresh({ target: { complete: () => {} } }); // chama o refresh ao fechar
    });

    await modal.present();
  }

  async editarDivida(divida: any, index: number) {
    const modal = await this.modalCtrl.create({
      component: DividaFormComponent,
      componentProps: {
        modo: 'categoria',
        categoriaId: this.categoria?.id,
        compra: { ...divida }, // reutiliza o campo compra para edição
        compraIndex: index,
      },
      breakpoints: [0, 0.8, 0.9],
      initialBreakpoint: 0.8,
      showBackdrop: true,
      backdropDismiss: true,
    });

    modal.onDidDismiss().then((retorno) => {
      if (retorno.data && retorno.data.divida) {
        // Atualiza a dívida editada no array da categoria
        this.categoria.dividas[index] = retorno.data.divida;
        this.doRefresh({ target: { complete: () => {} } });
      } else if (retorno.data && retorno.data.excluido) {
        // Remove a dívida do array da categoria
        this.categoria.dividas.splice(index, 1);
        this.doRefresh({ target: { complete: () => {} } });
      }
    });

    await modal.present();
  }

  doRefresh(event: any) {
    // Recarrega a categoria e as dívidas
    const id = this.route.snapshot.paramMap.get('id');
    this.categoria = this.financeiroService.getCategoriaById(id!);
    this.dividas = this.categoria?.dividas ? [...this.categoria.dividas] : [];
    this.ordenarDividasPorDia();

    setTimeout(() => {
      event.target.complete();
    }, 600); // tempo para simular carregamento, ajuste se quiser
  }

  voltar() {
    this.navCtrl.navigateBack(['/nav/carteira']);
  }
}
