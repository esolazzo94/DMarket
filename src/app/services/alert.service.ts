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

  constructor(public dialog: MatDialog) {
  }

  openDialog(messageUser: string, error: boolean) {

    if(error) {
      let dialogRef = this.dialog.open(AlertDialog, {
        width: '250px',
        data: {message: messageUser}
      });
    }
    else {
      let dialogRef = this.dialog.open(MessageDialog, {
        width: '250px',
        data: {message: messageUser}
      });
    }
    
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

@Component({
  selector: 'message.componentdialog',
  templateUrl: 'message.componentdialog.html',
})
export class MessageDialog {
  constructor(
    public dialogRef: MatDialogRef<AlertDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}