import { Component } from '@angular/core';

@Component({
  selector: 'app-config',
  templateUrl: 'config.page.html',
  styleUrls: ['config.page.scss'],
  standalone: false,
})
export class ConfigPage {
  notificacoesAtivas = false;
  modoNoturno = false;

  constructor() {}

  alterarDadosConta() {
    // lógica para alterar dados
  }

  sair() {
    // lógica para sair
  }
}
