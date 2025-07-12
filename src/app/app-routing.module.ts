import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./nav/nav.module').then((m) => m.NavPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'cartoes',
    loadChildren: () =>
      import('./cartoes/cartoes.module').then((m) => m.CartoesPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'dividas',
    loadChildren: () =>
      import('./dividas/dividas.module').then((m) => m.DividasPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'cadastro',
    loadChildren: () =>
      import('./cadastro/cadastro.module').then((m) => m.CadastroPageModule),
  },
  {
    path: 'recuperar-senha',
    loadChildren: () =>
      import('./recuperar-senha/recuperar-senha.module').then(
        (m) => m.RecuperarSenhaPageModule
      ),
  },
  {
    path: 'perfil',
    loadChildren: () =>
      import('./perfil/perfil.module').then((m) => m.PerfilPageModule),
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
