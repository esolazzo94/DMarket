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
        {name: "RSA-OAEP", hash: "SHA-256"},
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

  downloadFile(item:Escrow) {
    console.log(item);
    console.log(this.privateKey);
  }

}


