import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import Web3 from 'web3';
import { WEB3 } from '../services/authentication.service';
import * as data from '../../../contract/build/contracts/Market.json';
import { saveAs } from 'file-saver';

import { Subject } from 'rxjs';
import { AlertService } from '../services/alert.service';
import { AuthenticationService } from '../services/authentication.service';
import { User } from '../models/user.model';
import { Product } from '../models/product.model';
import { Escrow } from '../models/escrow.model';

import * as EscrowContract from '../../../contract/build/contracts/MarketEscrow.json'


declare var uportconnect: any;
declare var IpfsApi: any;

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  private contractInstance;
  public balance$;



  constructor(
    private alertService: AlertService,
    private authenticationService: AuthenticationService,
    private router: Router,
    @Inject(WEB3) private web3: Web3) {
      var abi = JSON.parse(JSON.stringify(data)).abi;
      this.web3 = authenticationService.getWeb3();
      var contract = web3.eth.contract(abi);
      this.contractInstance = contract.at('0x115ff25b669825bb8209ff9dcd5863d96ffc8c79');
      this.balance$ = new Subject();
   }

   loginUser(addressLogin: string, returnUrl: string) {
    const decodedId = uportconnect.MNID.decode(addressLogin);
    //var address = decodedId.address;
    var address;
    if (navigator.appVersion.indexOf("Edge") !== -1) address = "0x1765960eEC68672800cefAa13A887438F37c523A";
    else address = "0x273231D0669268e0D7Fce9C80b302b1F007224B0";
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
                loginUser.purchaseTotalLenght = result[5].toNumber();
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
                localUser.purchaseTotalLenght = result[5].toNumber();
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
    return new Promise<Array<Product>>(async (resolve)=>{
    var localUser = new User;
    localUser = JSON.parse(localStorage.getItem('currentUser'));
    var products = new Array<Product>();
    var that = this;
    for (var i=0; i<localUser.productTotalLenght; i++) {
      var hash = await this.getProductCode(localUser.address,i);
        var product = await this.getProduct(hash);
        products.push(product);
      
      
    }   
    resolve(products);
    
   })
  }

  getProductCode(address:string, index:number):Promise<string> {
    return new Promise<string>(resolve=>{    
      this.contractInstance.getUserProduct.call(address,index,{ from: address }, function(error,result) {
        resolve(result);
      });
    })
  }


  getProduct(code:string):Promise<Product> {
    return new Promise<Product>(resolve=>{
      
    var localUser = new User;
    localUser = JSON.parse(localStorage.getItem('currentUser'));
    var product = new Product();
    var that = this;
    //var hash = this.contractInstance.getProductCode.call(index,{ from: localUser.address });
    that.contractInstance.products.call(code,{ from: localUser.address },function(error,result) {
      product.description = result[0];
      product.hash = code;
      product.seller = result[1];
      product.price = that.web3.fromWei(result[2].toNumber(),'ether');
      product.purchaseNumber = result[3].toNumber();
      resolve(product);
    });    
   })
  }

buyProduct(sellerAddress:string, hash:string):Promise<boolean> {
    return new Promise<boolean>(resolve=>{
      var localUser = new User;
      var that = this;
      localUser = JSON.parse(localStorage.getItem('currentUser'));
      var abi = JSON.parse(JSON.stringify(EscrowContract)).abi;
      var bytecode = JSON.parse(JSON.stringify(EscrowContract)).bytecode;
      var escrowContract = this.web3.eth.contract(abi);
      var contractAddress;

      var escrowIstance = escrowContract.new('0x115ff25b669825bb8209ff9dcd5863d96ffc8c79',hash,
        {
            from: localUser.address,
            gas: 4712388,
            gasPrice: 9000000000,
            data: bytecode,
        }, function (error, contract){
            if(error) {
              resolve(false);
            }
                
            if (typeof contract.address !== 'undefined') {
                console.log('Contract mined! address: ' + contract.address + '\ntransactionHash: ' + contract.transactionHash);
                contractAddress= contract.address;
                
                contract.setPayee.sendTransaction(sellerAddress,{from:localUser.address,gas : 2200000 },function(error,result){
                  if(error) resolve(false);
                });

                contract.setPayee.sendTransaction(sellerAddress,{from:localUser.address,gas : 2200000 },function(error,result){
                  if(error) resolve(false);
                });
                
                contract.deposit.sendTransaction(sellerAddress,{from:localUser.address,gas : 2200000, value:1000000000000000000},async function(error,result){
                  if(!error){
                    that.contractInstance.purchase.sendTransaction(hash,contractAddress,{from:localUser.address,gas : 2200000},function(error,result){
                      console.log(error,result);
                    });
                    that.contractInstance.addUserPurchase.sendTransaction(contractAddress,{from:localUser.address,gas : 2200000},function(error,result){
                      console.log(error,result);
                      resolve(true);
                    });
                    await that.getBalance(localUser.address);
                    
                  }
                });/*
                var depositEvent = contract.Deposited();
                depositEvent.watch(function(error, result){
                  console.log(result);
                  console.log(error);
                  if (!error)
                      {
                          console.log("Deposito avvenuto");
                      }
              });*/
              
            }
        });

      
    })
  }

  async registerUser(user: any) {
    const decodedId = uportconnect.MNID.decode(user.address);
    //var address = decodedId.address;
    var address;
    if (navigator.appVersion.indexOf("Edge") !== -1) address = "0x1765960eEC68672800cefAa13A887438F37c523A";
    else address = "0x273231D0669268e0D7Fce9C80b302b1F007224B0";
    var that = this;
    this.contractInstance.getUser(address,{ from: address},function(error,result){
      if (result[0] !== "") {
        that.alertService.openDialog("Utente già registrato",true);
        
      }
      else {    
        that.createKeyPair().then((publicKey) =>{
          that.contractInstance.addUser.sendTransaction(address,publicKey,user.name,user.avatar.uri,{ from: address,gas:3000000 },function(error,result){
            that.getBalance(address);
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
  return new Promise<boolean>((resolve) => {
    var localUser = new User;
  var that = this;
  localUser = JSON.parse(localStorage.getItem('currentUser'));
  var weiPrice = this.web3.toWei(price, 'ether');
  try {
    this.contractInstance.addProduct.sendTransaction(description, this.web3.fromAscii(String.fromCharCode.apply(null, new Uint8Array(hash))),weiPrice,{ from: localUser.address,gas:3000000},function(error,result){
      that.getBalance(localUser.address);
    if (result) {
     that.alertService.openDialog("Prodotto Aggiunto",false);
     resolve(true);
    }  
    else {
    that.alertService.openDialog("Impossibile aggiungere prodotto",true);
    resolve(false);
      }
    });   
  }
  catch(e) {
    that.alertService.openDialog("Impossibile aggiungere prodotto "+e.message,true);
    resolve(false);
  }
  });
}

deleteProduct(hash: string, index: number): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    var localUser = new User;
    var that = this;
    localUser = JSON.parse(localStorage.getItem('currentUser'));
    that.contractInstance.deleteProduct.sendTransaction(localUser.address,hash,index,{ from: localUser.address,gas:3000000}, function(error,result){
      that.getBalance(localUser.address);
      if (!error) {
        resolve(true);
      }
      else {
        resolve(false);
      }
    })
  })
}

getUserPurchases(): Promise<Array<Escrow>> {
  return new Promise<Array<Escrow>>( async (resolve) => {
      
    var localUser = new User;
    localUser = JSON.parse(localStorage.getItem('currentUser'));
    var escrows = new Array<Escrow>();
    
    for (var i=0; i<localUser.purchaseTotalLenght; i++) {
      var escrow = await this.getUserPurchase(localUser.address,i);
      escrows.push(escrow);   
    }   
    resolve(escrows);
        
   });

}

getUserPurchase(address:string, index:number): Promise<Escrow> {
  return new Promise<Escrow>(resolve=>{
    var that = this;
    this.contractInstance.getUserPurchase.call(address,index,{ from: address },function(error,result){

      var escrow = new Escrow;
      var abi = JSON.parse(JSON.stringify(EscrowContract)).abi;
      var contract = that.web3.eth.contract(abi);
      var escrowContractInstance = contract.at(result);

      escrowContractInstance.payee.call({ from: address },function(error,result){

        if (error) that.alertService.openDialog("Errore",true);
        else {
          escrow.seller = result;
          escrowContractInstance.primary.call({ from: address },function(error,result){
            if (error) that.alertService.openDialog("Errore",true);
            else {
              escrow.buyer = result;
              escrowContractInstance.hashFile.call({ from: address },function(error,result){
                if (error) that.alertService.openDialog("Errore",true);
                 else {
                   escrow.productHash = result;
                   resolve(escrow);
                 }
              });
            }
        });

        }
      });
           
      
    }); 

  });
}

getUserSales(): Promise<Array<Escrow>> {
  return new Promise<Array<Escrow>>( async (resolve) => {

    var localUser = new User;
    localUser = JSON.parse(localStorage.getItem('currentUser'));
    var escrows = new Array<Escrow>();

    var products = new Array<Product>()
    products = await this.getUserProducts();
    
    for (var i=0; i< products.length; i++) {
      for (var y=0; i<products[i].purchaseNumber; y++) {
        var escrow = await this.getProductSale(products[i].hash,y,localUser.address);
        escrows.push(escrow);   
      }  
    }
    resolve(escrows);
  });
}

getProductSale(hash: string, index:number, address:string): Promise<Escrow> {
  return new Promise<Escrow>( async (resolve) => {
    var that = this;
    this.contractInstance.getProductPurchase.call(hash,index,{ from: address },function(error,result){

      var escrow = new Escrow;
      var abi = JSON.parse(JSON.stringify(EscrowContract)).abi;
      var contract = that.web3.eth.contract(abi);
      var escrowContractInstance = contract.at(result);

      escrowContractInstance.payee.call({ from: address },function(error,result){

        if (error) that.alertService.openDialog("Errore",true);
        else {
          escrow.seller = result;
          escrowContractInstance.primary.call({ from: address },function(error,result){
            if (error) that.alertService.openDialog("Errore",true);
            else {
              escrow.buyer = result;
              escrowContractInstance.hashFile.call({ from: address },function(error,result){
                if (error) that.alertService.openDialog("Errore",true);
                 else {
                   escrow.productHash = result;
                   resolve(escrow);
                 }
              });
            }
        });
        }
      });            
    }); 
  });
}


  async getBalance(address: string){
    /*const decodedId = uportconnect.MNID.decode(address);
    var decodedAddress = decodedId.address;*/
    var decodedAddress = address;
    var that= this;

    
    
      this.web3.eth.getBalance(decodedAddress,(err,bal) =>{
        this.balance$.next(that.web3.fromWei(bal.toString(),"ether"));

         })
    
  }
  
}
