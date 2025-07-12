import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { FinanceiroService } from '../services/financeiro.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: false,
})
export class CadastroPage {
  nome: string = '';
  email: string = '';
  senha: string = '';
  dataNascimento: string = '';
  inputEmFoco = false;

  corPopup: string = 'erro';
  mensagemErro: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private financeiroService: FinanceiroService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  // Rota login
  irParaLogin() {
    this.router.navigate(['/login']);
  }

  // Requisitos para cadastrar
  async cadastrar() {
    const emailLimpo = this.email.trim(); //limpa o email

    // Validação dos campos obrigatórios
    if (
      !this.nome.trim() ||
      !emailLimpo ||
      !this.senha.trim() ||
      !this.dataNascimento.trim()
    ) {
      this.mensagemErro = 'Preencha todos os campos obrigatórios.';
      this.corPopup = 'erro';
      this.mostrarToast(this.mensagemErro, 'danger');
      return;
    }

    // Validação do email
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo);
    if (!emailValido) {
      this.mensagemErro = 'Digite um email válido.';
      this.corPopup = 'erro';
      this.mostrarToast(this.mensagemErro, 'danger');
      return;
    }

    // Validação da senha (mínimo 6 caracteres)
    if (this.senha.trim().length < 6) {
      this.mensagemErro = 'A senha deve ter pelo menos 6 caracteres.';
      this.corPopup = 'erro';
      this.mostrarToast(this.mensagemErro, 'danger');
      return;
    }

    // Loading enquanto busca na API
    const loading = await this.loadingCtrl.create({
      message: 'Cadastrando...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      const user = await this.authService.cadastrar(
        emailLimpo,
        this.senha.trim()
      );
      if (user && user.uid) {
        await this.financeiroService.salvarDadosUsuario(user.uid, {
          nome: this.nome,
          email: emailLimpo,
          dataNascimento: this.dataNascimento,
        });
      }
      await loading.dismiss();

      this.corPopup = 'sucesso';
      this.mensagemErro = 'Cadastro realizado com sucesso!';
      this.mostrarToast(this.mensagemErro, 'success');
      setTimeout(() => {
        this.mensagemErro = '';
        this.router.navigate(['/login']);
      }, 1500);
    } catch (error: any) {
      await loading.dismiss();
      this.corPopup = 'erro';
      if (error.code === 'auth/email-already-in-use') {
        this.mensagemErro = 'Já existe um usuário com esse email.';
      } else {
        this.mensagemErro = 'Erro ao cadastrar. Verifique sua conexão.';
      }
      this.mostrarToast(this.mensagemErro, 'danger');
    }
  }

  // Pop-up para informar os erros que der
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
}
