import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private api = 'https://68360978664e72d28e3faf8c.mockapi.io/api/v1/usuarios';

  constructor(private http: HttpClient) {}

  getUsuarioPorEmail(email: string): Observable<any[]> {
    const url = `${this.api}?email=${encodeURIComponent(email)}`;
    return this.http.get<any[]>(url).pipe(
      catchError((error) => {
        console.error('Erro ao buscar usuário:', error);
        // Se der 404 ou erro qualquer, retorna array vazio pra seguir com o cadastro
        return of([]);
      })
    );
  }

  getPerfilPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  criarUsuario(usuario: any): Observable<any> {
    return this.http.post(this.api, usuario);
  }

  atualizarUsuario(id: string, dados: any): Observable<any> {
    return this.http.put(`${this.api}/${id}`, dados);
  }

  deletarUsuario(id: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }
}