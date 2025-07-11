import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { PerfilService } from '../services/perfil.service';

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
    private perfilService: PerfilService,
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


    // Chama loading para verificação
    const loading = await this.loadingCtrl.create({
      message: 'Entrando...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      const usuarios = await this.perfilService
        .getUsuarioPorEmail(emailLimpo)
        .toPromise();

      await loading.dismiss();

      // Verifica email
      if (usuarios && usuarios.length > 0) {
        const usuario = usuarios[0];

        // Verifica senha
        if (usuario.senha?.trim() === senhaDigitada) {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('email', emailLimpo);
          this.email = '';
          this.senha = '';
          this.router.navigate(['/nav/home']); // Se tudo 'Ok', envia para o Home
        } else {
          this.mostrarToast('Senha incorreta.'); // Senha inválida
        }
      } else {
        this.mostrarToast('Email não encontrado.'); // Email não existe
      }
    } catch (error) { // Se não conseguir conectar ou achar a API, retorna o erro
      await loading.dismiss();
      console.error('Erro ao fazer login:', error);
      this.mostrarToast('Erro ao conectar ao servidor.');
    }
  }
}
