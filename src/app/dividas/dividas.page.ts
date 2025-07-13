import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FinanceiroFacadeService } from '../services/financeiro-facade.service'; // ✅ Novo
import { ModalController, NavController } from '@ionic/angular';
import { DividaFormComponent } from '../components/divida-form/divida-form.component';

@Component({
  selector: 'app-dividas',
  templateUrl: './dividas.page.html',
  styleUrls: ['./dividas.page.scss'],
  standalone: false,
})
export class DividasPage implements OnInit, OnDestroy {
  categoria: any;
  dividas: any[] = [];
  private dadosSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    public financeiroFacade: FinanceiroFacadeService, // ✅ Novo
    private modalCtrl: ModalController,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    // ✅ Carrega dados do Firebase primeiro
    const uid = localStorage.getItem('uid');
    if (uid) {
      await this.financeiroFacade.carregarFirebase(uid);
    }

    // Carrega dados iniciais
    await this.carregarDados();

    // ✅ Se inscreve para receber atualizações em tempo real
    this.dadosSubscription = this.financeiroFacade.dadosAtualizados$.subscribe(
      (dados) => {
        console.log('📱 Dívidas atualizadas automaticamente');
        this.carregarDados();
      }
    );
  }

  ngOnDestroy() {
    // Para a subscription quando sair da página
    if (this.dadosSubscription) {
      this.dadosSubscription.unsubscribe();
    }
  }

  async carregarDados() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.categoria = this.financeiroFacade.getCategoriaById(id);
      this.dividas = this.categoria?.dividas ? [...this.categoria.dividas] : [];
      this.ordenarDividasPorDia();
    }
  }

  ordenarDividasPorDia() {
    this.dividas.sort((a, b) => a.diaPagamento - b.diaPagamento);
  }

  async openAdicionarDivida() {
    const modal = await this.modalCtrl.create({
      component: DividaFormComponent,
      componentProps: {
        modo: 'categoria',
        categoriaId: this.categoria?.id,
      },
      breakpoints: [0, 0.8, 0.9],
      initialBreakpoint: 0.8,
      showBackdrop: true,
      backdropDismiss: true,
    });

    modal.onDidDismiss().then(async (retorno) => {
      if (retorno.data && retorno.data.salvo) {
        // ✅ NÃO salvar novamente - já foi salvo no modal
        console.log(`${retorno.data.acao} dívida:`, retorno.data.divida);

        // ✅ Apenas recarrega para atualizar a UI (opcional, o listener já faz isso)
        // this.carregarDados(); // Comentado pois o listener já atualiza
      }
    });

    await modal.present();
  }

  async editarDivida(divida: any, index: number) {
    const modal = await this.modalCtrl.create({
      component: DividaFormComponent,
      componentProps: {
        modo: 'categoria',
        categoriaId: this.categoria?.id,
        compra: divida,
        compraIndex: index,
      },
      breakpoints: [0, 0.8, 0.9],
      initialBreakpoint: 0.8,
      showBackdrop: true,
      backdropDismiss: true,
    });

    modal.onDidDismiss().then(async (retorno) => {
      if (retorno.data && retorno.data.salvo) {
        // ✅ NÃO salvar novamente - já foi salvo no modal
        console.log(`${retorno.data.acao} dívida:`, retorno.data.divida);
      } else if (retorno.data && retorno.data.excluido) {
        // ✅ NÃO salvar novamente - já foi excluído no modal
        console.log('Dívida excluída:', retorno.data);
      }
    });

    await modal.present();
  }

  async doRefresh(event: any) {
    const uid = localStorage.getItem('uid');
    if (uid) {
      await this.financeiroFacade.carregarFirebase(uid);
    }
    this.carregarDados();
    setTimeout(() => {
      event.target.complete();
    }, 600);
  }

  voltar() {
    this.navCtrl.navigateBack(['/nav/carteira']);
  }
}
