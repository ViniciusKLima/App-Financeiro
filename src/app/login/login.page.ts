import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email: string = '';
  senha: string = '';
  erroCampos = false;
  mensagemErro: string = '';
  inputEmFoco = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  // Rota para cadastro
  irParaCadastro() {
    this.router.navigate(['/cadastro']);
  }

  // Rota para recuperação de senha
  irParaEsqueceuSenha() {
    this.router.navigate(['/recuperar-senha']);
  }

  // Pop-up para erros
  async mostrarToast(mensagem: string, cor: string = 'danger') {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 3000,
      position: 'top',
      color: cor,
      buttons: [{ text: 'X', role: 'cancel' }],
    });
    await toast.present();
  }

  // Requisitos para login
  async logar() {
    const emailLimpo = this.email.trim();
    const senhaDigitada = this.senha.trim();

    // Verifica inputs preenchidos
    if (!emailLimpo || !senhaDigitada) {
      this.mostrarToast('Preencha todos os campos.');
      return;
    }

    // Valida formato do email
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo);
    if (!emailValido) {
      this.mostrarToast('Digite um email válido.');
      return;
    }

    // Chama loading para verificação
    const loading = await this.loadingCtrl.create({
      message: 'Entrando...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      // Tenta logar
      const user = await this.authService.login(emailLimpo, senhaDigitada);
      if (user && user.uid) {
        localStorage.setItem('uid', user.uid); // Salva o UID
        localStorage.setItem('isLoggedIn', 'true'); // Flag de login
        this.router.navigate(['/nav/home']);
      }
      await loading.dismiss();
    } catch (error: any) {
      await loading.dismiss();
      // Trata erros específicos do Firebase
      if (error.code === 'auth/user-not-found') {
        this.mostrarToast('Email não encontrado.'); // Email não existe
      } else if (error.code === 'auth/wrong-password') {
        this.mostrarToast('Senha incorreta.'); // Senha inválida
      } else {
        this.mostrarToast('Erro ao conectar ao servidor.'); // Outros erros
      }
    }
  }
}
