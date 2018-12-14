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
import { Escrow, State } from '../models/escrow.model';

import * as EscrowContract from '../../../contract/build/contracts/MarketEscrow.json'


declare var uportconnect: any;
declare var IpfsApi: any;

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  private contractInstance;
  public balance$;

  //readonly contractAddress = "0x3dfb7ec1ee107d33877b6dc362d7c65d1f09cc47"; //Work
  readonly contractAddress ="0xbb83830e98ba51da443b71e16a6c506d5259370d"; //Home
  //readonly contractAddress = "0x115ff25b669825bb8209ff9dcd5863d96ffc8c79";

  constructor(
    private alertService: AlertService,
    private authenticationService: AuthenticationService,
    private router: Router,
    @Inject(WEB3) private web3: Web3) {
      var abi = JSON.parse(JSON.stringify(data)).abi;
      this.web3 = new Web3 (authenticationService.getConnect().getProvider());//authenticationService.getWeb3();
      //this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
      //this.web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/aeed36baad5e48838a5b7869b2da89fa'));
      //var contract = this.web3.eth.contract(abi);
      //this.web3.setProvider(this.web3.currentProvider);
      var contract= this.web3.eth.contract(abi);
      this.contractInstance = contract.at(this.contractAddress);
      //this.contractInstance = this.authenticationService.getConnect().contract(abi).at(this.contractAddress);
      this.balance$ = new Subject();
   }

   loginUser(addressLogin: string, returnUrl: string) {
    const decodedId = uportconnect.MNID.decode(addressLogin);
    var address = decodedId.address;
    //var address;
    //if (navigator.appVersion.indexOf("OPR") !== -1) address = "0xE5d351DA4b19DD91694862aCb0c6C6B92E2Fe3dc";
    /*if (navigator.appVersion.indexOf("Edge") !== -1) address = "0x1765960eEC68672800cefAa13A887438F37c523A";
    else address = "0x273231D0669268e0D7Fce9C80b302b1F007224B0";*/
    var that = this;
    var loginUser = new User;
    loginUser.address = address;
    that.contractInstance.getUser(address,{ from: address},function(error,result){
      if (result[0] === "") {
        that.alertService.openDialog("Utente non registrato",true);
      }
      else if (!error) {
          if (!result[3]) {
                loginUser.name = result[1];
                loginUser.avatar = result[2];
                loginUser.publicKey = result[0];
                loginUser.productTotalLenght = result[4].toNumber();
                loginUser.purchaseTotalLenght = result[5].toNumber();
                loginUser.saleTotalLenght = result[6].toNumber();
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

   getUser(address:string):Promise<User> {
    return new Promise<User>(resolve=>{
    var user = new User;
    user.address = address;
    var localUser = new User;
    localUser = this.loadUser();

    this.contractInstance.getUser.call(address,{ from: localUser.address},function(error,result){
      if (result[0] === "") {
        resolve(null);
      }
      else {
        user.name = result[1];
        user.avatar = result[2];
        user.publicKey = result[0];
        user.productTotalLenght = result[4].toNumber();
        user.purchaseTotalLenght = result[5].toNumber();
        user.saleTotalLenght = result[6].toNumber();
        resolve(user); 
      }
     });
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
                localUser.saleTotalLenght = result[6].toNumber();
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

buyProduct(sellerAddress:string, hash:string, price:number):Promise<boolean> {
    return new Promise<boolean>(resolve=>{
      var localUser = new User;
      var that = this;
      var sellerAddressAfter = sellerAddress;
      var hashAfter = hash;
      var priceAfter = price;
      localUser = JSON.parse(localStorage.getItem('currentUser'));
      //var abi = JSON.parse(JSON.stringify(EscrowContract)).abi;
      //var bytecode = JSON.parse(JSON.stringify(EscrowContract)).bytecode;
      //var escrowContract = this.web3.eth.contract(abi);
      //var contractAddress;

      that.web3.eth.defaultAccount= localUser.address;
      this.contractInstance.purchase(hash,sellerAddress,localUser.address,async (error, txHash) =>{
        if(error) resolve(false);
        else {
        that.waitForMined(txHash, { blockNumber: null },
          function pendingCB () {
            console.log("wait");
          },
          async function successCB (data) {
            await that.getBalance(localUser.address);
            console.log(data);
            if(data) {
              localUser = await that.updateUser();
              that.contractInstance.getUserPurchase.call(localUser.address,localUser.purchaseTotalLenght-1,{ from: localUser.address }, function(error,result) {
                if(!error) {
                  that.contractInstance.afterEscrow(hashAfter,sellerAddressAfter,result,{value:that.web3.toWei(priceAfter*2,'ether')},async (error, txHash) =>{
                    if(error) resolve(false);
                    else {
                      that.waitForMined(txHash, { blockNumber: null },
                        function pendingCB () {
                          console.log("wait");
                        },
                        async function successCB (data) {
                          await that.getBalance(localUser.address);
                          console.log(data);
                          if(data) {
    
                            resolve(true);
                          }
                        },
                        that);
                    }
                  });
                }
              });
              
            }
            else resolve(false);
          }
          ,that);   
        }
        /**/
      });

      /*
      var escrowIstance = escrowContract.new(this.contractAddress,hash,
        {
            data: bytecode,
        },  (error, contract) => {
            if(error) {
              resolve(false);
            }
                
            if (typeof contract.address !== 'undefined') {
                console.log('Contract mined! address: ' + contract.address + '\ntransactionHash: ' + contract.transactionHash);
                contractAddress= contract.address;

                that.web3.eth.defaultAccount= localUser.address;
                contract.setPayee(sellerAddress,(error, txHash) =>{
                  if(error) resolve(false);
                });
                
                contract.depositFromBuyer({value:that.web3.toWei(price*2,'ether')},async (error, txHash) =>{
                  if(!error){
                                  
                      that.contractInstance.purchase(hash,contractAddress,(error, txHash) =>{
                        if(error) resolve(false);
                      });
                      that.contractInstance.addUserPurchase(contractAddress,(error, txHash) =>{
                        if(error) resolve(false);
                        else resolve(true);
                      });
                                       
                    await that.getBalance(localUser.address);
                    
                  }
                  else resolve(false);
                });
            }
        });*/
      
    })
  }

  async registerUser(user: any) {
    const decodedId = uportconnect.MNID.decode(user.address);
    var address = decodedId.address;
    //var address;
    //if (navigator.appVersion.indexOf("OPR") !== -1) address = "0xE5d351DA4b19DD91694862aCb0c6C6B92E2Fe3dc";
    /*if (navigator.appVersion.indexOf("Edge") !== -1) address = "0x1765960eEC68672800cefAa13A887438F37c523A";
    else address = "0x273231D0669268e0D7Fce9C80b302b1F007224B0";*/
    var that = this;
    this.contractInstance.getUser(address,{ from: address},function(error,result){
      if (result[0] !== "") {
        that.alertService.openDialog("Utente già registrato",true);
        
      }
      else {    
        that.createKeyPair().then((publicKey) =>{
        
          that.web3.eth.defaultAccount= address;
          that.contractInstance.addUser(address,publicKey,user.name,user.avatar.uri, async (error, txHash) => {
            if (error) that.alertService.openDialog("Errore nella registazione "+error.message,true); 
            else {
            that.waitForMined(txHash, { blockNumber: null },
              function pendingCB () {
                console.log("wait");
              },
              async function successCB (data) {
                if (data) { 
                  that.alertService.openDialog("Registrazione completata.\n Conserva il file chiave scaricato.",false);
                  await that.getBalance(address);                 
                }
                else {
                  that.alertService.openDialog("Errore nella registazione "+error.message,true); 
                }
              }
              ,that);    
            }  
          })    
       });       
      }
    });
  }

  // Callback handler for whether it was mined or not
private waitForMined (txHash, response, pendingCB, successCB, that) {
  if (response.blockNumber) {
    successCB(response.blockNumber)
  } else {
    pendingCB()
      this.pollingLoop(txHash, response, pendingCB, successCB, that)
  }
}

// Recursive polling to do continuous checks for when the transaction was mined
private pollingLoop (txHash, response, pendingCB, successCB, that)  {
  setTimeout(function () {
    this.web3.eth.getTransaction(txHash, (error, response) => {
      if (error) { throw error }
        if (response === null) {
          response = { blockNumber: null }
        } // Some ETH nodes do not return pending tx
        that.waitForMined(txHash, response, pendingCB, successCB,that)
    })
  }, 1000) // check again in one sec.
}


  public byteArrayToBase64(byteArray){
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

public hash(bytes):string {
 return this.web3.fromAscii(String.fromCharCode.apply(null, new Uint8Array(bytes)));
}

async addProduct(description:string, price:number, hashBytes:any):Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    var localUser = new User;
  var that = this;
  localUser = JSON.parse(localStorage.getItem('currentUser'));
  var weiPrice = this.web3.toWei(price, 'ether');
  try {
    that.web3.eth.defaultAccount= localUser.address;
    this.contractInstance.addProduct(description,this.hash(hashBytes),weiPrice,(error, txHash)=>{
      that.getBalance(localUser.address);
    if (!error) {
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
    that.web3.eth.defaultAccount= localUser.address;
    that.contractInstance.deleteProduct(localUser.address,hash,index,(error, txHash) =>{
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
      escrow.escrowAddress = result;

      escrowContractInstance.payee.call({ from: address },function(error,result){

        if (error) that.alertService.openDialog("Errore",true);
        else {
          escrow.seller = result;
          escrowContractInstance.buyer.call({ from: address },function(error,result){
            if (error) that.alertService.openDialog("Errore",true);
            else {
              escrow.buyer = result;
              escrowContractInstance.hashFile.call({ from: address },function(error,result){
                if (error) that.alertService.openDialog("Errore",true);
                 else {
                   escrow.productHash = result;
                   escrowContractInstance.state.call({ from: address },function(error,result){
                    escrow.state = State[result];
                    resolve(escrow);
                  });
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
      for (var y=0; y<products[i].purchaseNumber; y++) {
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
      escrow.escrowAddress = result;

      escrowContractInstance.payee.call({ from: address },function(error,result){

        if (error) that.alertService.openDialog("Errore",true);
        else {
          escrow.seller = result;
          escrowContractInstance.buyer.call({ from: address },function(error,result){
            if (error) that.alertService.openDialog("Errore",true);
            else {
              escrow.buyer = result;
              escrowContractInstance.hashFile.call({ from: address },function(error,result){
                if (error) that.alertService.openDialog("Errore",true);
                 else {
                   escrow.productHash = result;                  
                   escrowContractInstance.state.call({ from: address },function(error,result){
                     escrow.state = State[result];
                     resolve(escrow);
                   });
                 }
              });
            }
        });
        }
      });            
    }); 
  });
}
/*
  getUserPublicKeyBytes(): Promise<Uint8Array> {
    return new Promise<Uint8Array>( resolve => {

      const reader = new FileReader(); 
    if(event.target.files && event.target.files.length === 1) {
      const [file] = event.target.files;
      reader.readAsArrayBuffer(event.target.files[0]);
  
      reader.onloadend = () => {
        var contents = reader.result;
      var hash = crypto.subtle.digest('SHA-256',contents).then(hashed=>{
        this.hash = hashed;
        this.isFileUploaded = true;
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

      //Connceting to the ipfs network via infura gateway
      const ipfs = new IpfsApi('ipfs.infura.io', '5001', {protocol: 'https'});

      ipfs.files.get(validCID, function (err, files) {
        files.forEach((file) => {
          console.log(file.path)
          console.log(file.content.toString('utf8'))
        })
      })

    });
  }*/

  getPublicKey(address:string): Promise<string> {
    return new Promise<string>( async(resolve) => {

      

        //Connceting to the ipfs network via infura gateway
      const ipfs = new IpfsApi('ipfs.infura.io', '5001', {protocol: 'https'});

      var keyAddress = await this.getPublicKeyAddress(address);

      ipfs.files.get(keyAddress, function (err, file) {
          resolve(file[0].content.toString('utf8'));
      });

      
    });
  }

  getPublicKeyAddress(address:string):Promise<string> {
    return new Promise<string>( resolve => {
      this.contractInstance.getUser(address,{ from: address},function(error,result){
        if(!error) resolve(result[0]);
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

  public base64ToByteArray(base64String:string):Uint8Array{
    var binaryString = window.atob(base64String);
    var byteArray = new Uint8Array(binaryString.length);
    for (var i=0; i<binaryString.length; i++){
        byteArray[i] += binaryString.charCodeAt(i);
    }
    return byteArray;
  }

  public loadFile(hashLoadedFile:string,encryptedFileAddress:string, encryptedSessionKeyAddress:string,name:string, escrowAddress:string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      var localUser = this.loadUser();
      var that =this;
      var escrowContractInstance = this.loadEscrowContract(escrowAddress);

      escrowContractInstance.price.call ({from:localUser.address},function(error,result) {

        if(!error) {
          escrowContractInstance.setFile.sendTransaction(hashLoadedFile,encryptedFileAddress,encryptedSessionKeyAddress,name,{from:localUser.address,gas : 2200000, value:result}, function(error,result){
            if(result) resolve(true);
            else resolve(false);
            that.getBalance(localUser.address);
          });
        }

      });
    });
  }

  private loadUser():User {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  private loadEscrowContract (address:string):any {
    var abi = JSON.parse(JSON.stringify(EscrowContract)).abi;
    var contract = this.web3.eth.contract(abi);
    return  contract.at(address);
  }

  public downloadkey(escrowAddress:string): Promise<string> {
    return new Promise<string>((resolve) => {
      var localUser = this.loadUser();
      var escrowContractIstance = this.loadEscrowContract(escrowAddress);

      escrowContractIstance.keyAddress.call({ from: localUser.address }, function (error,result){

        if(!error) {
          const ipfs = new IpfsApi('ipfs.infura.io', '5001', {protocol: 'https'});
          ipfs.files.get(result, function (err, file) {
            resolve(file[0].content.toString('utf8'));
        });
        }
      });

    });
  }

  public downloadFile(escrowAddress:string): Promise<Array<Uint8Array>>  {
    return new Promise<Array<Uint8Array>>((resolve) => {
      var localUser = this.loadUser();
      var escrowContractIstance = this.loadEscrowContract(escrowAddress);

      escrowContractIstance.addressEncryptedFile.call({ from: localUser.address }, function (error,result){

        if(!error) {
          const ipfs = new IpfsApi('ipfs.infura.io', '5001', {protocol: 'https'});
          ipfs.files.get(result, function (err, file) {
            var readedObject = Array<Uint8Array>();
            //return ivBytes and file
            readedObject[0] = file[0].content.slice(0,16);
            readedObject[1] = file[0].content.slice(16);
            resolve(readedObject);
        });
        }
      });

    });
  }

  public getFileName(escrowAddress:string): Promise<string>  {
    return new Promise<string>((resolve) => {
      var localUser = this.loadUser();
      var escrowContractIstance = this.loadEscrowContract(escrowAddress);

      escrowContractIstance.nameFile.call({ from: localUser.address }, function (error,result){
        if(!error) resolve(result);
      });
    });
  }

  public withdraw(escrowAddress:string,hash:string): Promise<boolean>  {
    return new Promise<boolean>((resolve) => {
      var that = this;
      var localUser = this.loadUser();
      var escrowContractIstance = this.loadEscrowContract(escrowAddress);

      escrowContractIstance.withdraw.sendTransaction(hash,{from:localUser.address,gas : 2200000}, async(error,result)=>{
        await that.getBalance(localUser.address);
        if (result) resolve(true);
        else resolve(false);
      });

    });
  }

  
}
