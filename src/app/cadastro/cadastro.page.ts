import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/core/auth.service';
import { FinanceiroFacadeService } from '../services/financeiro-facade.service';
import { AppComponent } from '../app.component';

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
  confirmarSenha: string = '';
  mostrarSenha: boolean = false;
  mostrarConfirmarSenha: boolean = false;
  inputEmFoco = false;

  corPopup: string = 'erro';
  mensagemErro: string = '';

  constructor(
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController, // ✅ ADICIONE ESTE IMPORT
    private authService: AuthService,
    private financeiroFacade: FinanceiroFacadeService,
    private appComponent: AppComponent
  ) {}

  // Rota login
  irParaLogin() {
    this.router.navigate(['/login']);
  }

  // Requisitos para cadastrar
  async cadastrar() {
    const emailLimpo = this.email.trim();

    // Validação dos campos obrigatórios
    if (
      !this.nome.trim() ||
      !emailLimpo ||
      !this.senha.trim() ||
      !this.confirmarSenha.trim()
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

    // Validação se as senhas coincidem
    if (this.senha !== this.confirmarSenha) {
      this.mensagemErro = 'As senhas não coincidem.';
      this.corPopup = 'erro';
      this.mostrarToast(this.mensagemErro, 'danger');
      return;
    }

    // Loading enquanto busca na API
    const loading = await this.loadingCtrl.create({
      message: 'Criando conta...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      // ✅ CORREÇÃO: Use createUserWithEmailAndPassword
      const user = await this.authService.createUserWithEmailAndPassword(
        this.email,
        this.senha
      );

      if (user && user.uid) {
        localStorage.setItem('uid', user.uid);
        localStorage.setItem('isLoggedIn', 'true');

        await this.financeiroFacade.inicializar(user.uid);

        this.limparCampos();

        await loading.dismiss();

        // ✅ MOSTRA SPLASH SIMPLES APÓS CADASTRO
        this.appComponent.mostrarSplashSimples();

        // ✅ Navega após um delay para mostrar o splash
        setTimeout(() => {
          this.router.navigate(['/nav/home'], { replaceUrl: true });
        }, 200);
      }
    } catch (error: any) {
      await loading.dismiss();
      this.corPopup = 'erro';

      let mensagemErro = 'Erro ao cadastrar. Verifique sua conexão.';

      if (error.code === 'auth/email-already-in-use') {
        mensagemErro = 'Já existe um usuário com esse email.';
      } else if (error.code === 'auth/weak-password') {
        mensagemErro = 'A senha é muito fraca.';
      } else if (error.code === 'auth/invalid-email') {
        mensagemErro = 'Email inválido.';
      }

      this.mensagemErro = mensagemErro;
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

  // Método para alternar visibilidade da senha
  alternarVisibilidadeSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  // Método para alternar visibilidade da confirmação de senha
  alternarVisibilidadeConfirmarSenha() {
    this.mostrarConfirmarSenha = !this.mostrarConfirmarSenha;
  }

  // Método para limpar os campos do formulário
  limparCampos() {
    this.nome = '';
    this.email = '';
    this.senha = '';
    this.confirmarSenha = '';
    this.mostrarSenha = false;
    this.mostrarConfirmarSenha = false;
  }
}
