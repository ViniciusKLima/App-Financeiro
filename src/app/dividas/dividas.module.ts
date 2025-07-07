import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DividasPageRoutingModule } from './dividas-routing.module';

import { DividasPage } from './dividas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DividasPageRoutingModule
  ],
  declarations: [DividasPage]
})
export class DividasPageModule {}
