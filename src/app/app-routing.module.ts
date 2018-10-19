import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { UserComponent } from './user/user.component';
import { ProductsComponent } from './products/products.component';
import { PurchasesComponent } from './purchases/purchases.component';
import { SalesComponent } from './sales/sales.component';

import { AuthGuard } from './guards/auth.guard';


const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'user', component: UserComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'purchases', component: ProductsComponent },
  { path: 'sales', component: ProductsComponent },

  // default to home
  { path: '**', redirectTo: '' }
];


@NgModule({
  imports: [ RouterModule.forRoot(routes, {useHash: true}) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}