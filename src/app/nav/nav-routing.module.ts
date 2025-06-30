import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavPage } from './nav.page';

const routes: Routes = [
  {
    path: 'nav',
    component: NavPage,
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('../home/home.module').then((m) => m.HomePageModule),
      },
      {
        path: 'carteira',
        loadChildren: () =>
          import('../carteira/carteira.module').then((m) => m.CarteiraPageModule),
      },
      {
        path: 'config',
        loadChildren: () =>
          import('../config/config.module').then((m) => m.ConfigPageModule),
      },
      {
        path: '',
        redirectTo: '/nav/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/nav/home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class NavPageRoutingModule {}
