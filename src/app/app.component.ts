import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform, ModalController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FinanceiroFacadeService } from './services/financeiro-facade.service'; // ✅ Novo

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  private lastBack = 0;
  carregando = true;
  showSplash = true; // controla a exibição do splash

  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private router: Router,
    private financeiroFacade: FinanceiroFacadeService // ✅ Novo
  ) {
    this.initializeApp();
  }

  async ngOnInit() {
    this.initializeApp();

    setTimeout(() => {
      this.showSplash = false;
    }, 3000);

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const uid = localStorage.getItem('uid');

    if (isLoggedIn && uid) {
      try {
        await this.financeiroFacade.recuperarDadosFirebase(uid);
        await this.financeiroFacade.inicializar(uid);
        this.router.navigate(['/nav/home']);
      } catch (error) {
        console.error('❌ Erro ao inicializar dados:', error);
        this.router.navigate(['/login']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy() {
    this.financeiroFacade.finalizar();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(10, async () => {
        // Fecha modal se houver algum aberto
        const topModal = await this.modalCtrl.getTop();
        if (topModal) {
          this.modalCtrl.dismiss();
          return;
        }

        const url = this.router.url;

        // Se estiver em cartões, volta para carteira
        if (url.startsWith('/cartoes')) {
          this.router.navigateByUrl('/nav/carteira');
          return;
        }

        // Se estiver em dívidas, volta para carteira
        if (url.startsWith('/dividas')) {
          this.router.navigateByUrl('/nav/carteira');
          return;
        }

        // Se estiver em outras páginas do nav
        if (url.startsWith('/nav/cartoes') || url.startsWith('/nav/dividas')) {
          this.router.navigateByUrl('/nav/carteira');
          return;
        }

        if (url.startsWith('/nav/config')) {
          this.router.navigateByUrl('/nav/carteira');
          return;
        }

        if (url.startsWith('/nav/carteira')) {
          this.router.navigateByUrl('/nav/home');
          return;
        }

        // Se estiver no home, não faz nada (ou pode sair do app)
      });
    });
  }
}
