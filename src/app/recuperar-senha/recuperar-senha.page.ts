import { Component } from '@angular/core';
import { ToastController, NavController } from '@ionic/angular';
import { Auth } from '@angular/fire/auth';
import { sendPasswordResetEmail } from 'firebase/auth';

@Component({
  selector: 'app-recuperar-senha',
  templateUrl: './recuperar-senha.page.html',
  styleUrls: ['./recuperar-senha.page.scss'],
  standalone: false,
})
export class RecuperarSenhaPage {
  email: string = '';

  constructor(
    private toastController: ToastController,
    public navCtrl: NavController,
    private auth: Auth
  ) {}

  // Pop-up para erros
  async presentToast(message: string, color: 'success' | 'danger' = 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'top',
    });
    await toast.present();
  }

  async recuperarSenha() {
    if (!this.email) {
      this.presentToast('Preencha o campo de email.');
      return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
    if (!emailValido) {
      this.presentToast('Digite um e-mail válido.');
      return;
    }

    try {
      await sendPasswordResetEmail(this.auth, this.email);
      this.presentToast('Email de recuperação enviado!', 'success');
      this.navCtrl.navigateBack('/login');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        this.presentToast('Email não encontrado.');
      } else {
        this.presentToast('Erro ao enviar email. Tente novamente.');
      }
    }
  }
}
