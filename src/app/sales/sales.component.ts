import { Component, OnInit } from '@angular/core';
import { ContractService } from '../services/contract.service';
import { AlertService } from '../services/alert.service';

import { Escrow } from '../models/escrow.model';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit {

  public escrows:Array<Escrow>;
  public loaded = false;
  public loadFileEnabled = false;
  public icon_lock = 'lock';

  constructor(private contractService: ContractService,
    private alertService: AlertService) {
      this.escrows = [];
     }

  async ngOnInit() {
    var user = await this.contractService.updateUser();
    localStorage.setItem('currentUser', JSON.stringify(user)); 
    this.escrows = await this.contractService.getUserSales();
    this.loaded = true;
  }

  loadKey(event) {

    const reader = new FileReader(); 
    if(event.target.files && event.target.files.length === 1) {
      const [file] = event.target.files;
      reader.readAsText(event.target.files[0]);
  
      reader.onloadend = () => {
        var privateKetBytes = this.base64ToByteArray(reader.result);

        window.crypto.subtle.importKey(
          "pkcs8",
          privateKetBytes,
        {name: "RSA-OAEP", hash: "SHA-256"},
        false,
        ["decrypt"]
      ).then(function(publicKey) {
        console.log(publicKey);
      });
      
      }    
    }
   else {
     if (event.target.files.length >= 1) {
      this.alertService.openDialog("Puoi caricare un solo file",true);   
     }
     else {
      this.alertService.openDialog("Errore nel caricamento file",true);  
     }
   }    

    this.icon_lock = 'lock_open';
    this.loadFileEnabled = true;
  }

  base64ToByteArray(base64String:string):Uint8Array{
    var binaryString = window.atob(base64String);
    var byteArray = new Uint8Array(binaryString.length);
    for (var i=0; i<binaryString.length; i++){
        byteArray[i] += binaryString.charCodeAt(i);
    }
    return byteArray;
}

  async loadFile(address:string) {
    var publicKeyString = await this.contractService.getPublicKey(address);
    console.log(publicKeyString);
    var publicKeyBytes = this.base64ToByteArray(publicKeyString);
    window.crypto.subtle.importKey(
      "spki",
      publicKeyBytes,
    {name: "RSA-OAEP", hash: "SHA-256"},
    false,
    ["encrypt"]
  ).then(function(publicKey) {
    console.log(publicKey);
  });

  }

}
