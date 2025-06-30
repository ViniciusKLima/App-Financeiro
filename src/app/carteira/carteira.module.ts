import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarteiraPage } from './carteira.page';

import { CarteiraPageRoutingModule } from './carteira-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    CarteiraPageRoutingModule,
  ],
  declarations: [CarteiraPage],
})
export class CarteiraPageModule {}
