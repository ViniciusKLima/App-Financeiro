import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/core/auth.service';
import { FinanceiroFacadeService } from '../services/financeiro-facade.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email: string = '';
  senha: string = '';
  mostrarSenha: boolean = false; // Adicione esta variável
  erroCampos = false;
  mensagemErro: string = '';
  inputEmFoco = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private financeiroFacade: FinanceiroFacadeService // ✅ Novo
  ) {}

  ngOnInit() {
    this.limparCampos();
  }

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

  // Método para limpar os inputs
  limparCampos() {
    this.email = '';
    this.senha = '';
    this.mostrarSenha = false;
    this.mensagemErro = '';
    this.erroCampos = false;
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

    // Loading para verificação
    const loading = await this.loadingCtrl.create({
      message: 'Entrando...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      const user = await this.authService.login(emailLimpo, senhaDigitada);
      if (user && user.uid) {
        localStorage.setItem('uid', user.uid);
        localStorage.setItem('isLoggedIn', 'true');

        // ✅ Corrigir método
        await this.financeiroFacade.inicializar(user.uid);

        this.limparCampos();
        this.router.navigate(['/nav/home']);
      }
      await loading.dismiss();
    } catch (error: any) {
      await loading.dismiss();
      // Trata erros específicos do Firebase
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/invalid-email'
      ) {
        this.mostrarToast('Email ou senha incorretos.');
      } else if (error.code === 'auth/network-request-failed') {
        this.mostrarToast('Erro de conexão. Verifique sua internet.');
      } else {
        this.mostrarToast('Email ou senha incorretos.');
      }
    }
  }

  // Adicione este método
  alternarVisibilidadeSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }
}
