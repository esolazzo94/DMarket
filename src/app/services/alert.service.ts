import { Injectable, Component, Inject } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { MatDialog,MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface DialogData {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  message: string;
  errorFlag: boolean;

  constructor(public dialog: MatDialog) {
    this.errorFlag = false;
  }



  openDialog(message: string, error: boolean) {
    this.message = message;
    this.errorFlag = error;
    let dialogRef = this.dialog.open(AlertDialog, {
      width: '250px',
      data: {message: this.message }
    });

  }

}

@Component({
  selector: 'alert.componentdialog',
  templateUrl: 'alert.componentdialog.html',
})
export class AlertDialog {
  constructor(
    public dialogRef: MatDialogRef<AlertDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}