import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CategoriaFormComponent } from './components/categoria-form/categoria-form.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DividaFormComponent } from './components/divida-form/divida-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

registerLocaleData(localePt);

@NgModule({
  declarations: [AppComponent, CategoriaFormComponent, DividaFormComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ScreenOrientation,
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
