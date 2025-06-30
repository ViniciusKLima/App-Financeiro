import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NavPageRoutingModule } from './nav-routing.module';

import { NavPage } from './nav.page';

@NgModule({
  imports: [IonicModule, CommonModule, FormsModule, NavPageRoutingModule],
  declarations: [NavPage],
})
export class NavPageModule {}
