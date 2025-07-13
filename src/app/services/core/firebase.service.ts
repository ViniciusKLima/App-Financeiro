import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteField,
  onSnapshot,
  Unsubscribe,
} from '@angular/fire/firestore';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private unsubscribe: Unsubscribe | null = null;
  private dadosAtualizados = new Subject<any>();

  constructor(private firestore: Firestore) {}

  get dadosAtualizados$() {
    return this.dadosAtualizados.asObservable();
  }

  // Salva dados no Firebase com merge
  async salvarDados(uid: string, dados: any) {
    if (navigator.onLine) {
      try {
        const docRef = doc(this.firestore, 'usuarios', uid); // ✅ usuarios
        await setDoc(docRef, dados, { merge: true });
        console.log('✅ Dados salvos no Firebase');
      } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        throw error;
      }
    }
  }

  // Carrega dados do Firebase
  async carregarDados(uid: string) {
    console.log('🔍 Firebase - Carregando dados para UID:', uid);

    if (navigator.onLine) {
      try {
        const docRef = doc(this.firestore, 'usuarios', uid); // ✅ usuarios
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const dados = docSnap.data();
          console.log('📋 Firebase - Dados encontrados:', dados);
          return dados;
        } else {
          console.log('❌ Firebase - Documento não existe');
          // Cria documento inicial se não existir
          await setDoc(docRef, {
            cartoes: [],
            categorias: [],
            pagamentos: {},
          });
          return { cartoes: [], categorias: [], pagamentos: {} };
        }
      } catch (error) {
        console.error('❌ Firebase - Erro ao carregar:', error);
        throw error;
      }
    }
    console.log('📴 Firebase - Offline, retornando null');
    return null;
  }

  // Inicia listener em tempo real
  iniciarListener(uid: string) {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    const docRef = doc(this.firestore, 'usuarios', uid);
    this.unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const dados = docSnap.data();
          this.dadosAtualizados.next(dados);
          console.log('📱 Dados sincronizados do Firebase');
        }
      },
      (error) => {
        console.error('Erro no listener Firebase:', error);
      }
    );
  }

  // Para listener
  pararListener() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  // Salva status de pagamento
  async salvarStatusPagamento(
    uid: string,
    compromissoId: string,
    pago: boolean
  ) {
    try {
      const docRef = doc(this.firestore, 'usuarios', uid);
      await updateDoc(docRef, {
        [`pagamentos.${compromissoId}`]: pago
          ? {
              pago: true,
              dataPagamento: new Date().toISOString().slice(0, 10),
            }
          : deleteField(),
      });
    } catch (error) {
      console.error('Erro ao salvar status de pagamento:', error);
    }
  }

  // Carrega status de pagamentos
  async carregarStatusPagamentos(uid: string) {
    try {
      const docRef = doc(this.firestore, 'usuarios', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return data['pagamentos'] || {};
      }
    } catch (error) {
      console.error('Erro ao carregar status de pagamentos:', error);
    }
    return {};
  }
}
