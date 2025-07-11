import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { PerfilService } from '../services/perfil.service';
import { firstValueFrom } from 'rxjs';

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
  peso: number | null = null;
  altura: number | null = null;
  metaAgua: number | null = null;
  inputEmFoco = false;
  imc: number | null = null;
  imcIdeal: number = 22.0;
  imcClassificacao: string = '';
  private perfilOriginal: any = {};
  private usuarioId: string = '';

  constructor(
    private navCtrl: NavController,
    private toastController: ToastController,
    private perfilService: PerfilService
  ) {}

  // Pop-up para avisos
  async presentToast(mensagem: string, cor: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 1800,
      color: cor,
      position: 'top',
    });
    toast.present();
  }

  // Traz os dados da API
  ngOnInit() {
    const email = localStorage.getItem('email');
    if (email) {
      this.perfilService.getUsuarioPorEmail(email).subscribe((users) => {
        if (users.length) {
          const perfil = users[0];
          this.usuarioId = perfil.id;
          this.nome = perfil.nome || '';
          this.dataNascimento = perfil.dataNascimento
            ? perfil.dataNascimento.split('T')[0]
            : '';
          this.email = perfil.email || '';
          this.peso = perfil.peso || null;
          this.altura = perfil.altura || null;
          this.metaAgua = perfil.metaAgua || null;
          this.atualizarCalculos();
          this.perfilOriginal = {
            nome: this.nome,
            dataNascimento: this.dataNascimento,
            email: this.email,
            peso: this.peso,
            altura: this.altura,
            metaAgua: this.metaAgua,
          };
        }
      });
    }
  }

  ionViewWillEnter() {
    document.body.classList.add('page-perfil');
  }

  ionViewWillLeave() {
    document.body.classList.remove('page-perfil');
  }

  // Verifica se mudou os valores, para liberar o botão
  houveAlteracao(): boolean {
    return (
      this.nome !== this.perfilOriginal.nome ||
      this.dataNascimento !== this.perfilOriginal.dataNascimento ||
      this.email !== this.perfilOriginal.email ||
      this.peso !== this.perfilOriginal.peso ||
      this.altura !== this.perfilOriginal.altura ||
      this.metaAgua !== this.perfilOriginal.metaAgua
    );
  }

  // Requisitos para salvar
  async salvarPerfil() {
    if (!this.usuarioId) {
      await this.presentToast('Erro ao identificar usuário!', 'danger');
      return;
    }

    // Verifica caracteres do email
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
    if (!emailValido) {
      await this.presentToast('Digite um email válido.', 'danger');
      return;
    }

    if (this.email !== this.perfilOriginal.email) {
      const users = await firstValueFrom(
        this.perfilService.getUsuarioPorEmail(this.email)
      );

      // Verifica se o email já está sendo usado
      if (users.length && users[0].id !== this.usuarioId) {
        await this.presentToast(
          'Já existe um usuário com esse email.',
          'danger'
        );
        return;
      }
    }

    this.atualizarPerfilBackend();
  }

  // Atualiza os dados
  private atualizarPerfilBackend() {
    const dadosAtualizados = {
      nome: this.nome,
      email: this.email,
      peso: this.peso,
      altura: this.altura,
      metaAgua: this.metaAgua,
      dataNascimento: this.dataNascimento,
    };
    this.perfilService
      .atualizarUsuario(this.usuarioId, dadosAtualizados)
      .subscribe(() => {
        this.atualizarCalculos();
        this.presentToast('Informações salvas com sucesso!', 'success');
        this.perfilOriginal = { ...dadosAtualizados };
        // Atualiza o email no localStorage se ele foi alterado
        localStorage.setItem('email', this.email);
      });
  }

  // Atualiza o IMC
  atualizarCalculos() {
    if (this.peso && this.altura) {
      const alturaMetros = this.altura / 100;
      this.imc = +(this.peso / (alturaMetros * alturaMetros)).toFixed(1);
      this.imcClassificacao = this.classificarIMC(this.imc);
    } else {
      this.imc = null;
      this.imcClassificacao = '';
    }
  }

  classificarIMC(imc: number): string {
    if (imc < 18.5) return 'Abaixo do peso';
    if (imc < 25) return 'Peso normal';
    if (imc < 30) return 'Sobrepeso';
    if (imc < 35) return 'Obesidade grau I';
    if (imc < 40) return 'Obesidade grau II';
    return 'Obesidade grau III';
  }

  getImcClass(): string {
    if (this.imc === null) return '';
    if (this.imc < 18.5) return 'imc-abaixo';
    if (this.imc < 25) return 'imc-normal';
    if (this.imc < 30) return 'imc-sobrepeso';
    if (this.imc < 35) return 'imc-obesidade1';
    if (this.imc < 40) return 'imc-obesidade2';
    return 'imc-obesidade3';
  }
}
