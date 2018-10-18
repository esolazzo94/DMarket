import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { MaterialModule } from  './material/material.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AppRoutingModule } from './/app-routing.module';
import { AlertComponent } from './alert/alert.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AlertComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
