import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private auth: Auth) {}

  async login(email: string, senha: string): Promise<User | null> {
    const cred = await signInWithEmailAndPassword(this.auth, email, senha);
    return cred.user;
  }

  async cadastrar(email: string, senha: string): Promise<User | null> {
    const cred = await createUserWithEmailAndPassword(this.auth, email, senha);
    return cred.user;
  }

  async logout() {
    await signOut(this.auth);
  }

  get usuarioAtual() {
    return this.auth.currentUser;
  }
}
