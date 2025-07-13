import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth) {}

  async cadastrar(email: string, senha: string): Promise<User | null> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        senha
      );
      return userCredential.user;
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      throw error;
    }
  }

  async login(email: string, senha: string): Promise<User | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        senha
      );
      return userCredential.user;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  get usuarioAtual(): User | null {
    return this.auth.currentUser;
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
}
