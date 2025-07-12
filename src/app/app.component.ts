import { Component, OnInit } from '@angular/core';
import { Platform, ModalController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Keyboard } from '@capacitor/keyboard';
import { FinanceiroService } from './services/financeiro.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  private lastBack = 0;
  carregando = true;
  showSplash = true; // controla a exibição do splash

  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private router: Router,
    private financeiroService: FinanceiroService // Adicione aqui
  ) {
    this.initializeApp();
  }

  async ngOnInit() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const uid = localStorage.getItem('uid');
    if (isLoggedIn === 'true' && uid) {
      await this.financeiroService.carregarFirebase(uid); // Aguarda carregar os dados
      this.showSplash = false; // Só some o splash quando terminar!
      this.router.navigate(['/nav/home']);
    } else {
      this.showSplash = false;
      this.router.navigate(['/login']);
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      Keyboard.setScroll({ isDisabled: false });

      this.platform.backButton.subscribeWithPriority(10, async () => {
        // Fecha modal se houver algum aberto
        const topModal = await this.modalCtrl.getTop();
        if (topModal) {
          this.modalCtrl.dismiss();
          return;
        }

        const url = this.router.url;

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

        // Se estiver no home, não faz nada
      });
    });
  }
}
