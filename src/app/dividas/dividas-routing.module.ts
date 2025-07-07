import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DividasPage } from './dividas.page';

const routes: Routes = [
  {
    path: ':id',
    component: DividasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DividasPageRoutingModule {}
