import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./nav/nav.module').then(m => m.NavPageModule)
  },
  {
    path: 'cartoes',
    loadChildren: () => import('./cartoes/cartoes.module').then( m => m.CartoesPageModule)
  },
  {
    path: 'dividas',
    loadChildren: () => import('./dividas/dividas.module').then( m => m.DividasPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
