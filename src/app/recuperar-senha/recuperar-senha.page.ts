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
    private toastCtrl: ToastController,
    public navCtrl: NavController, // ← MUDOU DE private PARA public
    private auth: Auth
  ) {}

  async recuperarSenha() {
    if (!this.email) {
      this.mostrarToast('Por favor, digite seu email.');
      return;
    }

    try {
      await sendPasswordResetEmail(this.auth, this.email);
      this.mostrarToast(
        'Email de recuperação enviado! Verifique sua caixa de entrada.',
        'success'
      );
      this.navCtrl.navigateBack('/login');
    } catch (error) {
      this.mostrarToast(
        'Erro ao enviar email de recuperação. Verifique o email digitado.'
      );
    }
  }

  async mostrarToast(mensagem: string, cor: string = 'danger') {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 3000,
      color: cor,
      position: 'top',
    });
    toast.present();
  }
}
