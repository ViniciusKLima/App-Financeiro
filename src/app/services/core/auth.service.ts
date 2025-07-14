import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  User,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  // ✅ Login
  async login(email: string, password: string): Promise<User | null> {
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  // ✅ Cadastro
  async createUserWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<User | null> {
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    }
  }

  // ✅ Logout
  async logout(): Promise<void> {
    try {
      const auth = getAuth();
      await signOut(auth);
      localStorage.removeItem('uid');
      localStorage.removeItem('isLoggedIn');
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  }

  // ✅ Usuário atual
  getCurrentUser(): User | null {
    try {
      const auth = getAuth();
      return auth.currentUser;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  }
}
