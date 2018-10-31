import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import Web3 from 'web3';
import { WEB3 } from '../services/authentication.service';
import * as data from '../../../contract/build/contracts/Market.json';
import { saveAs } from 'file-saver';

import { Observable } from 'rxjs';
import { AlertService } from '../services/alert.service';
import { User } from '../models/user.model';
import { Product } from '../models/product.model';


declare var uportconnect: any;
declare var IpfsApi: any;

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  private contractInstance;

  constructor(
    private alertService: AlertService,
    private router: Router,
    @Inject(WEB3) private web3: Web3) {
      var abi = JSON.parse(JSON.stringify(data)).abi;
      var contract = web3.eth.contract(abi);
      this.contractInstance = contract.at('0x115ff25b669825bb8209ff9dcd5863d96ffc8c79');
   }

   loginUser(addressLogin: string, returnUrl: string) {
    const decodedId = uportconnect.MNID.decode(addressLogin);
    //var address = decodedId.address;
    var address = "0x273231D0669268e0D7Fce9C80b302b1F007224B0";
    var that = this;
    var loginUser = new User;
    loginUser.address = address;
    that.contractInstance.getUser(address,{ from: address},function(error,result){
      if (result === "") {
        that.alertService.openDialog("Utente non registrato",true);
      }
      else if (!error) {
          if (!result[3]) {
                loginUser.name = result[1];
                loginUser.avatar = result[2];
                loginUser.publicKey = result[0];
                loginUser.productTotalLenght = result[4].toNumber();
                localStorage.setItem('currentUser', JSON.stringify(loginUser));
                var localUser = localStorage.getItem('currentUser');
                that.router.navigate([returnUrl]);                 
          } 
          else {
            that.alertService.openDialog("Utente Bloccato.\n Contatta un amministratore.",true);
          }          
      }
      else {
        that.alertService.openDialog("Errore nel login\n"+error.message,true);
      }
    }); 
   }

   async updateUser():Promise<User> {
    return new Promise<User>(resolve=>{
    var localUser = new User;
    localUser = JSON.parse(localStorage.getItem('currentUser'));
    var that = this;
    this.contractInstance.getUser(localUser.address,{ from: localUser.address},function(error,result){
      if (result[0] === "") {
        that.alertService.openDialog("Utente non registrato",true);
      }
      else if (!error) {
          if (!result[3]) {
                localUser.name = result[1];
                localUser.avatar = result[2];
                localUser.publicKey = result[0];
                localUser.productTotalLenght = result[4].toNumber();
               resolve(localUser);              
          } 
          else {
            that.alertService.openDialog("Utente Bloccato.\n Contatta un amministratore.",true);
            resolve(null);
          }          
      }
      else {
        that.alertService.openDialog("Errore nel login\n"+error.message,true);
        resolve(null);
      }
    }); 
    })
   }

   getUserProducts():Promise<Array<Product>> {
    return new Promise<Array<Product>>(resolve=>{
    var localUser = new User;
    localUser = JSON.parse(localStorage.getItem('currentUser'));
    var products = new Array<Product>();
    var that = this;
    for (var i=0; i<localUser.productTotalLenght; i++) {
      this.contractInstance.getUserProduct.call(localUser.address,i,{ from: localUser.address },function(error,result){
        that.contractInstance.products.call(result,{ from: localUser.address },function(error,result){
          var product = new Product;
          product.description = result[0];
          product.seller = result[1];
          product.price = that.web3.fromWei(result[2].toNumber(),'ether');
          product.purchaseNumber = result[3].toNumber();
          products.push(product);
        });
      })     
    }   
    resolve(products);
   })
  }

  async registerUser(user: any) {
    const decodedId = uportconnect.MNID.decode(user.address);
    //var address = decodedId.address;
    var address = "0x273231D0669268e0D7Fce9C80b302b1F007224B0";
    var that = this;
    this.contractInstance.getUser(address,{ from: address},function(error,result){
      if (result[0] !== "") {
        that.alertService.openDialog("Utente già registrato",true);
        
      }
      else {    
        that.createKeyPair().then((publicKey) =>{
          that.contractInstance.addUser.sendTransaction(address,publicKey,user.name,user.avatar.uri,{ from: address,gas:3000000 },function(error,result){
            if(!error) {
            that.alertService.openDialog("Registrazione completata.\n Conserva il file chiave scaricato.",false);
          }
          else {
            that.alertService.openDialog("Errore nella registazione "+error.message,true);
          }    
        });
       });       
      }
    });
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
                    resolve(result[0].path);
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
                
            }, function(err) {
              that.alertService.openDialog("Errore in registrazione: " + err.message,true);
            })
    
        }, function(err){
          that.alertService.openDialog("Errore in registrazione: " + err.message,true);
        })
    }); 
}


async addProduct(description:string, price:number, hash:any):Promise<boolean> {
  var localUser = new User;
  var that = this;
  localUser = JSON.parse(localStorage.getItem('currentUser'));
  var weiPrice = this.web3.toWei(price, 'ether');
  try {
    var result = await this.contractInstance.addProduct.sendTransaction(description, this.web3.fromAscii(String.fromCharCode.apply(null, new Uint8Array(hash))),weiPrice,{ from: localUser.address,gas:3000000});
    if (result) {
     that.alertService.openDialog("Prodotto Aggiunto",false);
     return true;
    }  
    else {
    that.alertService.openDialog("Impossibile aggiungere prodotto",true);
    return false;
    }
  }
  catch(e) {
    that.alertService.openDialog("Impossibile aggiungere prodotto "+e.message,true);
    return false;
  }
  
}


  getBalance(address: string): Observable<string> {
    /*const decodedId = uportconnect.MNID.decode(address);
    var decodedAddress = decodedId.address;*/
    var decodedAddress = address;

    return new Observable<string>((observer) =>  { 
      this.web3.eth.getBalance(decodedAddress,(err,bal) =>{
        observer.next(this.web3.fromWei(bal.toString(),"ether"));

         })
    })
  }
  
}
