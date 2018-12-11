import { Component, OnInit } from '@angular/core';
import { ContractService } from '../services/contract.service';
import { CommonService } from '../services/common.service';
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
  public loadFileEnabled = true;
  public spinnerFlag = false;
  
  private encryptedFileAddress:string;
  private encryptedSessionKeyAddress:string;
  private hashOriginalFile:string;
  private hashLoadedFile:string;
  private filename:string;

  constructor(private contractService: ContractService,
    private commonService: CommonService,
    private alertService: AlertService) {
      this.escrows = [];
      this.encryptedFileAddress = null;
      this.encryptedSessionKeyAddress = null;
     }

  async ngOnInit() {
    var user = await this.contractService.updateUser();
    localStorage.setItem('currentUser', JSON.stringify(user)); 
    this.escrows = await this.contractService.getUserSales();
    this.loaded = true;
  }
/*
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
  }*/

  

  async loadFile(address:string,escrowAddress:string,originalHash:string,event) {
    var that = this;
    const reader = new FileReader(); 
    if(event.target.files && event.target.files.length === 1) {
      const file = event.target.files;
      reader.readAsArrayBuffer(event.target.files[0]);
      this.spinnerFlag = true;
  
      reader.onloadend = async (event) => {
        var fileBytes = new Uint8Array(reader.result);
        this.filename = file[0].name;

        that.hashLoadedFile = await that.commonService.hashing(fileBytes);

        if (that.hashLoadedFile === originalHash ) {

          var publicKeyString = await this.contractService.getPublicKey(address);
    console.log(publicKeyString);
    var publicKeyBytes = this.contractService.base64ToByteArray(publicKeyString);
    window.crypto.subtle.importKey(
      "spki",
      publicKeyBytes,
    {name: "RSA-OAEP", hash: {name: "SHA-256"}},
    false,
    ["encrypt"]
  ).then(function(publicKey) {
    console.log(publicKey);
    //generate random session key
    return window.crypto.subtle.generateKey(
      {name: "AES-CBC", length: 256},
      true,
      ["encrypt", "decrypt"]
    ).then(function(sessionKey) {
      var ivBytes = window.crypto.getRandomValues(new Uint8Array(16));
      
      //Encrypt file
      window.crypto.subtle.encrypt(
        {name: "AES-CBC", iv: ivBytes}, sessionKey, fileBytes
    ).then(async (ciphertextBuffer) => {

        var cipher = new Uint8Array(ivBytes.length + new Uint8Array(ciphertextBuffer).length);
        cipher.set(ivBytes);
        cipher.set(new Uint8Array(ciphertextBuffer), ivBytes.length);

        that.encryptedFileAddress = await that.commonService.sendFile(cipher);


        //Encrypt session key
    window.crypto.subtle.exportKey(
      "raw", sessionKey
  ).then(function(sessionKeyBuffer) {
      // Encrypt the session key in the buffer, save the encrypted
      // key in the keyBox element.
      window.crypto.subtle.encrypt(
        {
          name: "RSA-OAEP",
          //hash: "SHA-256" //For Microsoft Edge
      },
          publicKey,  
          sessionKeyBuffer
      ).then(async (encryptedSessionKeyBuffer) => {
          var encryptedSessionKeyBytes = new Uint8Array(encryptedSessionKeyBuffer);
          var encryptedSessionKeyBase64 = that.contractService.byteArrayToBase64(encryptedSessionKeyBytes);

          that.encryptedSessionKeyAddress = await that.commonService.sendFile(encryptedSessionKeyBase64);

          var result = await that.contractService.loadFile(that.hashLoadedFile,that.encryptedFileAddress,that.encryptedSessionKeyAddress,that.filename,escrowAddress);

          if (result) {
            that.loadFileEnabled = false;
            that.escrows = await that.contractService.getUserSales();
            that.alertService.openDialog("File caricato",false);    
            that.spinnerFlag = false;      
          }

          else {
            that.alertService.openDialog("Errore nel caricamento del file",true);
            that.spinnerFlag = false;
          }

          
      });
    });
    });

   });
  });

        }   
        
        else {
          that.alertService.openDialog("Non hai caricato il file corretto",true); 
          that.spinnerFlag = false;
        }
      
      }    
    }
   else {
     if (event.target.files.length >= 1) {
      this.alertService.openDialog("Puoi caricare un solo file",true);
      that.spinnerFlag = false;   
     }
     else {
      this.alertService.openDialog("Errore nel caricamento file",true); 
      that.spinnerFlag = false; 
     }
   } 


    

  }

}
