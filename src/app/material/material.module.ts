import { NgModule } from '@angular/core';

import { MatButtonModule,MatToolbarModule,MatSidenavModule,MatIconModule,MatListModule,MatCardModule,MatProgressSpinnerModule,MatDialogModule} from  '@angular/material';
 
 
@NgModule({
imports: [MatButtonModule,MatToolbarModule,MatSidenavModule,MatIconModule,MatListModule,MatCardModule,MatProgressSpinnerModule,MatDialogModule],
exports: [MatButtonModule,MatToolbarModule,MatSidenavModule,MatIconModule,MatListModule,MatCardModule,MatProgressSpinnerModule,MatDialogModule],
 
})
 
export  class  MaterialModule { }