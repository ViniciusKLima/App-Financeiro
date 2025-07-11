import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PerfilService } from '../services/perfil.service';
import { LoadingController, ToastController } from '@ionic/angular';

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
  peso: number | null = null;
  altura: number | null = null;
  metaAgua: number | null = null;
  dataNascimento: string = '';
  dieta: string = '';
  inputEmFoco = false;

  corPopup: string = 'erro';
  mensagemErro: string = '';

  dietas = [
    { nome: 'Perder Peso', descricao: '...', indice: 0 },
    { nome: 'Manter Peso', descricao: '...', indice: 1 },
    { nome: 'Ganhar Peso', descricao: '...', indice: 2 },
  ];
  dietaSelecionada = 0;

  constructor(
    private router: Router,
    private perfilService: PerfilService,
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

    // Verificação de Preenchimento dos Inputs
    if (
      !this.nome.trim() ||
      !emailLimpo ||
      !this.senha.trim() ||
      !this.dataNascimento.trim() ||
      !this.peso ||
      !this.altura ||
      !this.metaAgua
    ) {
      this.corPopup = 'erro';
      this.mensagemErro = 'Preencha todos os campos obrigatórios.';
      setTimeout(() => { this.mensagemErro = ''; }, 3000);
      return;
    }

    // Verificação de email válido
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo);
    if (!emailValido) {
      this.corPopup = 'erro';
      this.mensagemErro = 'Digite um email válido.';
      setTimeout(() => { this.mensagemErro = ''; }, 3000);
      return;
    }

    // Loading enquanto busca na API
    const loading = await this.loadingCtrl.create({
      message: 'Verificando...',
      spinner: 'crescent',
    });
    await loading.present();

    // Verificação se já existe
    try {
      const usuarios = await this.perfilService.getUsuarioPorEmail(emailLimpo).toPromise();
      if (usuarios && usuarios.length > 0) {
        await loading.dismiss();
        this.corPopup = 'erro';
        this.mensagemErro = 'Já existe um usuário com esse email.';
        setTimeout(() => { this.mensagemErro = ''; }, 3000);
        return;
      }

      // Cria o usuário
      const usuario = {
        nome: this.nome.trim(),
        email: emailLimpo,
        senha: this.senha,
        dataNascimento: this.dataNascimento,
        peso: this.peso,
        altura: this.altura,
        metaAgua: this.metaAgua,
        dieta: this.dietas[this.dietaSelecionada].nome,
        dietaIndice: this.dietaSelecionada,
      };

      // Usa a função do service para enviar à API
      const resultado = await this.perfilService.criarUsuario(usuario).toPromise();
      await loading.dismiss();

      this.corPopup = 'sucesso';
      this.mensagemErro = 'Cadastro realizado com sucesso!';
      setTimeout(() => {
        this.mensagemErro = '';
        this.router.navigate(['/login']);
      }, 1500);

    } catch (error) { // Se não conseguir conectar ou achar API, retorna o erro
      await loading.dismiss();
      console.error('Erro ao cadastrar:', error);
      this.corPopup = 'erro';
      this.mensagemErro = 'Erro ao cadastrar. Verifique sua conexão.';
      setTimeout(() => { this.mensagemErro = ''; }, 3000);
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

