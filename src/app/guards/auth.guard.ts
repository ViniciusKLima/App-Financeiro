import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/core/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkAuth(state.url);
  }

  private checkAuth(url: string): boolean {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const uid = localStorage.getItem('uid');

    // ✅ Verifica autenticação básica
    if (!isLoggedIn || !uid) {
      console.log('🔒 AuthGuard - Usuário não logado');
      this.redirectToLogin(url);
      return false;
    }

    // ✅ Verifica se o UID é válido (não vazio)
    if (uid.trim().length === 0) {
      console.log('🔒 AuthGuard - UID inválido');
      this.clearAuth();
      this.redirectToLogin(url);
      return false;
    }

    // ✅ Verifica se o Firebase Auth está sincronizado (opcional para offline)
    try {
      const firebaseUser = this.authService.getCurrentUser();
      if (firebaseUser && firebaseUser.uid !== uid) {
        console.log(
          '🔒 AuthGuard - Descorrelação entre localStorage e Firebase'
        );
        this.clearAuth();
        this.redirectToLogin(url);
        return false;
      }
    } catch (error) {
      // ✅ Se Firebase falhar (offline), ainda permite acesso
      console.log('⚠️ AuthGuard - Firebase offline, permitindo acesso local');
    }

    console.log('✅ AuthGuard - Acesso permitido');
    return true;
  }

  private redirectToLogin(returnUrl: string): void {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl },
    });
  }

  private clearAuth(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('uid');
  }
}
