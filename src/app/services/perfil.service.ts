import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  constructor(private firestore: Firestore) {}

  // Busca perfil pelo UID do usuário logado
  async getPerfilPorUid(uid: string): Promise<any> {
    const docRef = doc(this.firestore, 'usuarios', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  }

  // Atualiza dados do perfil do usuário logado
  async atualizarPerfil(uid: string, dados: any): Promise<void> {
    const docRef = doc(this.firestore, 'usuarios', uid);
    await setDoc(docRef, dados, { merge: true });
  }

  // Deleta perfil do usuário logado
  async deletarPerfil(uid: string): Promise<void> {
    const docRef = doc(this.firestore, 'usuarios', uid);
    await deleteDoc(docRef);
  }
}
