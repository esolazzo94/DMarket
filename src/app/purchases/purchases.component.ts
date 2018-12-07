import { Component, OnInit } from '@angular/core';
import { ContractService } from '../services/contract.service';
import { CommonService } from '../services/common.service';
import { AlertService } from '../services/alert.service';

import { Escrow } from '../models/escrow.model';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.css']
})
export class PurchasesComponent implements OnInit {

  public escrows:Array<Escrow>;
  public loaded = false;
  public icon_lock = 'lock';
  public downloadFileEnabled = false;
  private privateKey: CryptoKey = null;

  constructor(private contractService: ContractService,
    private commonService: CommonService,
    private alertService: AlertService) { 
      this.escrows = [];
    }

  async ngOnInit() {
    var user = await this.contractService.updateUser();
    localStorage.setItem('currentUser', JSON.stringify(user)); 
    this.escrows = await this.contractService.getUserPurchases();
    this.loaded = true;
  }

  
  loadKey(event) {
    var that = this;
    
    const reader = new FileReader(); 
    if(event.target.files && event.target.files.length === 1) {
      const [file] = event.target.files;
      reader.readAsText(event.target.files[0]);
  
      reader.onloadend = () => {
        var privateKetBytes = this.contractService.base64ToByteArray(reader.result);

        window.crypto.subtle.importKey(
          "pkcs8",
          privateKetBytes,
        {name: "RSA-OAEP", hash: {name: "SHA-256"}},
        false,
        ["decrypt"]
      ).then(function(privateKey) {
        that.privateKey = privateKey;
        that.icon_lock = 'lock_open';
        that.downloadFileEnabled = true;
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

  }

  async downloadFile(item:Escrow) {
    var encryptedKey = await this.contractService.downloadkey(item.escrowAddress);

    var encryptedSessionKeyBytes = this.contractService.base64ToByteArray(encryptedKey);

    try {
      var sessionKeyBuffer = await window.crypto.subtle.decrypt({name: "RSA-OAEP"}, this.privateKey, encryptedSessionKeyBytes);

      window.crypto.subtle.importKey(
        // We can't use the session key until it is in a CryptoKey object
        "raw", sessionKeyBuffer, {name: "AES-CBC", length: 256}, false, ["decrypt"]
    ).then(function(sessionKey){
      
        console.log(sessionKey);
        //Decrypt File

    });

    }
    catch(e) {
      this.alertService.openDialog("Hai caricato la chiave sbagliata",true);  
    }
    //this.contractService.downloadFile();
    //this.commonService.decryptFile();
    //this.commonService.hashing();
    //this.contractService.withdraw();
  }

}


