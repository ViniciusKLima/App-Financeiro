import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { PerfilService } from '../services/perfil.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false,
})
export class PerfilPage implements OnInit {
  nome: string = '';
  dataNascimento: string = '';
  email: string = '';
  inputEmFoco = false;
  private perfilOriginal: any = {};
  private usuarioId: string = '';

  constructor(
    private navCtrl: NavController,
    private toastController: ToastController,
    private perfilService: PerfilService
  ) {}

  // Exibe pop-up de aviso
  async presentToast(mensagem: string, cor: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 1800,
      color: cor,
      position: 'top',
    });
    toast.present();
  }

  // Busca os dados do perfil no Firestore ao iniciar a página
  async ngOnInit() {
    const uid = localStorage.getItem('uid'); // ou obtenha do AuthService
    if (uid) {
      this.usuarioId = uid;
      const perfil = await this.perfilService.getPerfilPorUid(uid);
      if (perfil) {
        this.nome = perfil.nome || '';
        this.dataNascimento = perfil.dataNascimento || '';
        this.email = perfil.email || '';
        this.perfilOriginal = {
          nome: this.nome,
          dataNascimento: this.dataNascimento,
          email: this.email,
        };
      }
    }
  }

  ionViewWillEnter() {
    document.body.classList.add('page-perfil');
  }

  ionViewWillLeave() {
    document.body.classList.remove('page-perfil');
  }

  // Verifica se houve alteração nos dados para liberar o botão de salvar
  houveAlteracao(): boolean {
    return (
      this.nome !== this.perfilOriginal.nome ||
      this.dataNascimento !== this.perfilOriginal.dataNascimento ||
      this.email !== this.perfilOriginal.email
    );
  }

  // Salva as alterações do perfil
  async salvarPerfil() {
    if (!this.usuarioId) {
      await this.presentToast('Erro ao identificar usuário!', 'danger');
      return;
    }

    // Validação do email
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
    if (!emailValido) {
      await this.presentToast('Digite um email válido.', 'danger');
      return;
    }

    // Validação dos campos obrigatórios
    if (!this.nome.trim() || !this.dataNascimento.trim()) {
      await this.presentToast(
        'Preencha todos os campos obrigatórios.',
        'danger'
      );
      return;
    }

    await this.atualizarPerfilBackend();
  }

  // Atualiza os dados no Firestore
  private async atualizarPerfilBackend() {
    const dadosAtualizados = {
      nome: this.nome,
      email: this.email,
      dataNascimento: this.dataNascimento,
    };
    await this.perfilService.atualizarPerfil(this.usuarioId, dadosAtualizados);
    this.presentToast('Informações salvas com sucesso!', 'success');
    this.perfilOriginal = { ...dadosAtualizados };
    localStorage.setItem('email', this.email);
  }
}
