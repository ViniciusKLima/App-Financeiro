import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    // Verifica se está logado no Firebase OU tem flag no localStorage
    const usuario = this.authService.usuarioAtual;
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const uid = localStorage.getItem('uid');

    if (usuario || (isLoggedIn && uid)) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
