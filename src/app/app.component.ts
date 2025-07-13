import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform, ModalController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FinanceiroFacadeService } from './services/financeiro-facade.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  private lastBack = 0;
  carregando = true;
  showSplash = true;
  primeiraVezAbrindo = true; // ✅ Controla se é a primeira vez

  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private router: Router,
    private financeiroFacade: FinanceiroFacadeService
  ) {
    this.initializeApp();
  }

  async ngOnInit() {
    // ✅ Verifica se é a primeira vez que abre o app
    const jaAbriuAntes = localStorage.getItem('appJaAbriu');
    this.primeiraVezAbrindo = !jaAbriuAntes;

    // ✅ Configurações do dispositivo
    if (this.platform.is('capacitor')) {
      try {
        await SplashScreen.hide();
        await StatusBar.setBackgroundColor({ color: '#1b57be' });
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (error) {
        console.error('Erro ao configurar dispositivo:', error);
      }
    }

    // ✅ Tempo de splash diferente para primeira vez vs carregamentos normais
    const tempoSplash = this.primeiraVezAbrindo ? 1200 : 600;

    await this.loadAppData();

    setTimeout(() => {
      this.hideSplash();
      // ✅ Marca que o app já foi aberto
      if (this.primeiraVezAbrindo) {
        localStorage.setItem('appJaAbriu', 'true');
      }
    }, tempoSplash);

    // ✅ Lógica de login
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

    // ✅ Escuta evento para mostrar splash simples
    document.addEventListener('mostrar-splash-simples', () => {
      this.mostrarSplashSimples();
    });
  }

  ngOnDestroy() {
    this.financeiroFacade.finalizar();
  }

  // ✅ Método único para inicializar app
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

  private async loadAppData(): Promise<void> {
    return new Promise((resolve) => {
      const tempoCarregamento = this.primeiraVezAbrindo ? 800 : 400;
      setTimeout(() => {
        // ✅ Aqui você pode carregar dados iniciais
        // - Verificar autenticação
        // - Carregar configurações
        // - Inicializar serviços
        resolve();
      }, tempoCarregamento);
    });
  }

  private hideSplash() {
    const splashElement = document.querySelector(
      '.splash-screen-inicial, .splash-screen-simples'
    );
    if (splashElement) {
      splashElement.classList.add('hide');
      setTimeout(() => {
        this.showSplash = false;
      }, 500);
    }
  }

  // ✅ Método para mostrar splash simples em carregamentos futuros
  public mostrarSplashSimples() {
    this.primeiraVezAbrindo = false;
    this.showSplash = true;

    setTimeout(() => {
      this.hideSplash();
    }, 600);
  }
}
