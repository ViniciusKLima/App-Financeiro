import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private auth: Auth) {}

  // Login
  async login(email: string, senha: string): Promise<User | null> {
    try {
      const cred: UserCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        senha
      );
      return cred.user;
    } catch (error) {
      throw error;
    }
  }

  // Cadastro
  async cadastrar(email: string, senha: string): Promise<User | null> {
    try {
      const cred: UserCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        senha
      );
      return cred.user;
    } catch (error) {
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      throw error;
    }
  }

  // Usuário atual
  get usuarioAtual(): User | null {
    return this.auth.currentUser;
  }
}
