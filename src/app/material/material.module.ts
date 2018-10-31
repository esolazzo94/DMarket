import { NgModule } from '@angular/core';
import { CustomMatPaginatorIntl } from './custom-mat-paginator-intl';

import {MatButtonModule,
        MatToolbarModule,
        MatSidenavModule,
        MatIconModule,
        MatListModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatStepperModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
        MatPaginatorIntl} from  '@angular/material';
 
 
@NgModule({
imports: [  MatButtonModule,
            MatToolbarModule,
            MatSidenavModule,
            MatIconModule,
            MatListModule,
            MatCardModule,
            MatProgressSpinnerModule,
            MatDialogModule,
            MatStepperModule,
            MatFormFieldModule,
            MatInputModule,
            MatPaginatorModule],
providers:[{provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl}
             ],
exports: [  MatButtonModule,
            MatToolbarModule,
            MatSidenavModule,
            MatIconModule,
            MatListModule,
            MatCardModule,
            MatProgressSpinnerModule,
            MatDialogModule,
            MatStepperModule,
            MatFormFieldModule,
            MatInputModule,
            MatPaginatorModule],
 
})
 
export  class  MaterialModule { }

