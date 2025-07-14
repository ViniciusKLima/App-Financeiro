import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/core/auth.service';
import { FinanceiroFacadeService } from '../services/financeiro-facade.service';
import { AppComponent } from '../app.component'; // ✅ ADICIONE ESTE IMPORT

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
  private returnUrl: string = '/nav/home'; // ✅ Nova variável

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private financeiroFacade: FinanceiroFacadeService, // ✅ Novo
    private route: ActivatedRoute, // ✅ Novo
    private appComponent: AppComponent // ✅ ADICIONE ESTE INJECT
  ) {}

  async ngOnInit() {
    // ✅ Pega a URL de retorno se houver
    this.route.queryParams.subscribe((params) => {
      this.returnUrl = params['returnUrl'] || '/nav/home';
    });
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

        // ✅ Inicializa os dados
        await this.financeiroFacade.inicializar(user.uid);

        this.limparCampos();

        await loading.dismiss();

        // ✅ MOSTRA SPLASH SIMPLES APÓS LOGIN
        this.appComponent.mostrarSplashSimples();

        // ✅ Navega após um delay para mostrar o splash
        setTimeout(() => {
          this.router.navigate([this.returnUrl], { replaceUrl: true });
        }, 200);
      }
    } catch (error: any) {
      await loading.dismiss();
      console.error('Erro ao fazer login:', error);

      let mensagemErro = 'Erro ao fazer login. Tente novamente.';

      if (error.code === 'auth/user-not-found') {
        mensagemErro = 'Usuário não encontrado.';
      } else if (error.code === 'auth/wrong-password') {
        mensagemErro = 'Senha incorreta.';
      } else if (error.code === 'auth/invalid-email') {
        mensagemErro = 'Email inválido.';
      } else if (error.code === 'auth/invalid-credential') {
        mensagemErro = 'Email ou senha incorretos.';
      }

      this.mostrarToast(mensagemErro);
    }
  }

  // Adicione este método
  alternarVisibilidadeSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }
}
