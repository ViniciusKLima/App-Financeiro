import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarteiraPage } from './carteira.page';

const routes: Routes = [
  {
    path: '',
    component: CarteiraPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CarteiraPageRoutingModule {}
