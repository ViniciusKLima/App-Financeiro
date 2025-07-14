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
  showSplash = true;
  primeiraVezAbrindo = true;
  private lastBack = 0;

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
    // ✅ SEMPRE inicia com splash completo
    this.showSplash = true;
    this.primeiraVezAbrindo = true;

    console.log('🚀 App iniciando com splash completo');

    // ✅ Configurações do dispositivo
    if (this.platform.is('capacitor')) {
      try {
        await SplashScreen.hide();
        await StatusBar.setBackgroundColor({ color: '#1b57be' }); // ✅ AZUL INICIAL
        await StatusBar.setStyle({ style: Style.Dark }); // ✅ ÍCONES BRANCOS INICIAL

        if (this.platform.is('android')) {
          await StatusBar.setOverlaysWebView({ overlay: false });
        }
      } catch (error) {
        console.error('Erro ao configurar dispositivo:', error);
      }
    }

    // ✅ Tempo para mostrar splash completo
    const tempoSplash = 2000;

    setTimeout(() => {
      this.hideSplash();
    }, tempoSplash);

    // ✅ Lógica de login
    await this.verificarLogin();
  }

  // ✅ Método para mostrar splash SIMPLES em carregamentos internos
  mostrarSplashSimples() {
    this.showSplash = true;
    this.primeiraVezAbrindo = false;

    setTimeout(() => {
      this.hideSplash();
    }, 1000); // 1 segundo para carregamentos internos
  }

  private async verificarLogin() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const uid = localStorage.getItem('uid');
    const currentUrl = this.router.url;

    if (isLoggedIn && uid) {
      try {
        await this.financeiroFacade.inicializar(uid);

        if (currentUrl === '/' || currentUrl === '/login') {
          this.router.navigate(['/nav/home']);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        this.router.navigate(['/login']);
      }
    } else {
      if (
        currentUrl !== '/login' &&
        currentUrl !== '/cadastro' &&
        currentUrl !== '/recuperar-senha'
      ) {
        this.router.navigate(['/login']);
      }
    }
  }

  hideSplash() {
    console.log('🔥 Escondendo splash');
    this.showSplash = false;

    // ✅ MUDA FUNDO PARA COR PADRÃO após splash
    setTimeout(() => {
      document.body.classList.add('app-loaded');
      document.querySelector('app-root')?.classList.add('app-loaded');
      document.querySelector('ion-app')?.classList.add('app-loaded');

      // ✅ Muda barras para cor padrão
      if (this.platform.is('capacitor')) {
        StatusBar.setBackgroundColor({ color: '#e4eef0' });
        StatusBar.setStyle({ style: Style.Light }); // ✅ ÍCONES PRETOS
      }
    }, 100);
  }

  // ✅ Método para usar em carregamentos internos se necessário
  recarregarApp() {
    this.mostrarSplashSimples();
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
}
