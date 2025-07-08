import { Component } from '@angular/core';
import { Platform, ModalController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  private lastBack = 0;

  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private router: Router
  ) {
    this.initializeApp();
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

        // Se tem histórico, volta
        if (window.history.length > 1) {
          window.history.back();
          return;
        }

        // Se está na home, pode fechar (ou peça confirmação)
        if (
          this.router.url === '/nav/home' ||
          this.router.url === '/nav/carteira' ||
          this.router.url === '/nav/config'
        ) {
          // Evita fechar acidentalmente: clique duas vezes para sair
          const now = Date.now();
          if (now - this.lastBack < 1500) {
            App.exitApp();
          } else {
            this.lastBack = now;
            // Opcional: mostre um toast "Pressione novamente para sair"
          }
          return;
        }

        // Se não, navega para home
        this.router.navigateByUrl('/nav/home');
      });
    });
  }
}
