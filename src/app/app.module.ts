import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from  './material/material.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AppRoutingModule } from './/app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, MatListModule } from '@angular/material';
import { UserComponent } from './user/user.component';
import { ProductsComponent } from './products/products.component';
import { SalesComponent } from './sales/sales.component';
import { PurchasesComponent } from './purchases/purchases.component';
import { AlertDialog } from './services/alert.service';
import { MessageDialog } from './services/alert.service';
import { MarketComponent } from './market/market.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { AddProductComponent } from './add-product/add-product.component';
import { AddSpacesPipe } from './add-spaces.pipe';
import { InfoComponent } from './info/info.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    UserComponent,
    ProductsComponent,
    SalesComponent,
    PurchasesComponent,
    AlertDialog,
    MessageDialog,
    MarketComponent,
    ProductDetailComponent,
    AddProductComponent,
    AddSpacesPipe,
    InfoComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    FormsModule,
    ReactiveFormsModule
  ],
  entryComponents: [AppComponent,AlertDialog,MessageDialog],
  providers: [UserComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
