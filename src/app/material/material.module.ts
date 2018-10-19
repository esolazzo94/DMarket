import { NgModule } from '@angular/core';

import { MatButtonModule,MatToolbarModule,MatSidenavModule,MatIconModule,MatListModule,MatCardModule,MatProgressSpinnerModule} from  '@angular/material';
 
 
@NgModule({
imports: [MatButtonModule,MatToolbarModule,MatSidenavModule,MatIconModule,MatListModule,MatCardModule,MatProgressSpinnerModule],
exports: [MatButtonModule,MatToolbarModule,MatSidenavModule,MatIconModule,MatListModule,MatCardModule,MatProgressSpinnerModule],
 
})
 
export  class  MaterialModule { }