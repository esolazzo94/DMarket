import { NgModule } from '@angular/core';

import { MatButtonModule,MatToolbarModule,MatSidenavModule,MatIconModule,MatListModule} from  '@angular/material';
 
 
@NgModule({
imports: [MatButtonModule,MatToolbarModule,MatSidenavModule,MatIconModule,MatListModule],
exports: [MatButtonModule,MatToolbarModule,MatSidenavModule,MatIconModule,MatListModule],
 
})
 
export  class  MaterialModule { }