import { Injectable, Inject } from '@angular/core';
import Web3 from 'web3';
import { WEB3 } from '../services/authentication.service';
import * as data from '../../../contract/build/contracts/Market.json';
import { saveAs } from 'file-saver';

import { Observable } from 'rxjs';
import { AlertService } from '../services/alert.service';

declare var uportconnect: any;
declare var IpfsApi: any;

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  private contractInstance;

  constructor(
    private alertService: AlertService,
    @Inject(WEB3) private web3: Web3) {
      var abi = JSON.parse(JSON.stringify(data)).abi;
      var contract = web3.eth.contract(abi);
      this.contractInstance = contract.at('0x97bab90ce5d3b641fd15666c14bd1edf24b3c600');
      console.log(this.contractInstance);
   }

  async registerUser(user: any) {
    const decodedId = uportconnect.MNID.decode(user.address);
    var address = decodedId.address;
    user.avatar.uri;
    user.name;
    var publicKey = await this.createKeyPair();

  }


  private byteArrayToBase64(byteArray){
    var binaryString = "";
    for (var i=0; i<byteArray.byteLength; i++){
        binaryString += String.fromCharCode(byteArray[i]);
    }
    var base64String = window.btoa(binaryString);
    return base64String;
}

  private createKeyPair() {
    return new Promise((resolve, reject) => {
        var publicKey,privateKey,spkiBytes,pkcs8Bytes;
        var that = this;
        window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]), // 65537
                hash: {name: "SHA-256"}
            },
            true,
            ["encrypt", "decrypt"])
            .then(function(keyPair) {
            publicKey = keyPair.publicKey;
            privateKey = keyPair.privateKey;
            // Export the public key portion
            window.crypto.subtle.exportKey("spki", keyPair.publicKey)
            .then(function(spkiBuffer) {
                spkiBytes = new Uint8Array(spkiBuffer);
                var spkiString = that.byteArrayToBase64(spkiBytes);
                //Connceting to the ipfs network via infura gateway
                const ipfs = new IpfsApi('ipfs.infura.io', '5001', {protocol: 'https'});

                ipfs.files.add(ipfs.types.Buffer.from(spkiString), (err, result) => {
                    console.log(err,"Indirizzo Chiave Pubblica "+ result[0].path);
                    resolve(result);
                });  
                              
            },function(err){
              this.alertService.openDialog("Errore in registrazione: " + err.message);
            });
    
            // Export the private key part, in parallel to the public key
            window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey
            ).then(function(pkcs8Buffer) {
                pkcs8Bytes = new Uint8Array(pkcs8Buffer);
                var pkcs8String = that.byteArrayToBase64(pkcs8Bytes);
                
                const blob = new Blob([pkcs8String], {type:"text/plain;charset=utf-8"});
                saveAs(blob, "chiave.asc");

                
    
                //encryptFile(contents);
                
            }, function(err) {
              that.alertService.openDialog("Errore in registrazione: " + err.message);
            })
    
        }, function(err){
          that.alertService.openDialog("Errore in registrazione: " + err.message);
        })
    }); 
}


  getBalance(address: string): Observable<string> {
    const decodedId = uportconnect.MNID.decode(address);
    var decodedAddress = decodedId.address;
    //var decodedAddress = address;

    return new Observable<string>((observer) =>  { 
      this.web3.eth.getBalance(decodedAddress,(err,bal) =>{
        observer.next(this.web3.fromWei(bal.toString(),"ether"));

         })
    })
  }
  
}
